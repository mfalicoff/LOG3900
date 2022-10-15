import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { ExpertVP } from './expert-virtual-player.service';
import { LetterBankService } from './letter-bank.service';
import { StandService } from './stand.service';
import { VirtualPlayerService } from './virtual-player.service';

@Service()
export class PlayAreaService {
    sio: io.Server;
    constructor(
        private standService: StandService,
        private letterBankService: LetterBankService,
        private virtualPService: VirtualPlayerService,
        private chatService: ChatService,
        private expertVPService: ExpertVP,
        private databaseService: DatabaseService,
        private boardService: BoardService,
    ) {
        this.sio = new io.Server();
    }

    initSioPlayArea(sio: io.Server) {
        this.sio = sio;
    }

    changePlayer(game: GameServer) {
        // removes all temporary tiles and get the tmp that were in the board
        const tmpLetter = this.boardService.rmTempTiles(game);
        // Update les tiles du board en old
        this.updateOldTiles(game);
        
        const playerThatJustPlayed = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        if (playerThatJustPlayed) {
            // we add the tmp letter to the stand of the player that just played
            this.standService.putLettersOnStand(game, tmpLetter, playerThatJustPlayed);
            // update the variable that contains the number of letter in the reserve
            this.updateStandAndReserveView(game, playerThatJustPlayed);
            // add a turn to the player that just played
            playerThatJustPlayed.turn += 1;
        }
        // is the game is finished we stop the game
        if (game.gameFinished && playerThatJustPlayed) {
            this.sendGameToAllClientInRoom(game);
            this.triggerStopTimer(game.roomName);
            return;
        }

        // changes the current player
        game.idxPlayerPlaying = (game.idxPlayerPlaying + 1) % game.mapPlayers.size;
        const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        if (playerPlaying.idPlayer === 'virtualPlayer') {
            this.virtualPlayerAction(game, playerPlaying);
        }

        // Updates the game of all players
        this.sendGameToAllClientInRoom(game);

        // reset le timer pour les deux clients
        this.triggerTimer(game);
    }

    playGame(game: GameServer) {
        // Basic set of values
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
        game.gameStarted = true;
        game.startTime = new Date().getTime();

        // init the stand for each player
        for (const player of game.mapPlayers.values()) {
            this.standService.onInitStandPlayer(game.letters, game.letterBank, player);
        }

        // determine the first player to play and also set this player to the master time
        // (reminder: the master time is the player that controls the timer for the game)
        game.idxPlayerPlaying = Math.floor(Math.random() * game.mapPlayers.size);

        // we set the master timer, it has to be a human client not a virtual player
        game.setMasterTimer();

        // we send the game to all the players
        this.sendGameToAllClientInRoom(game);
        // tell all our clients to start the timer
        this.triggerTimer(game);

        const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        // make the virtual player play
        if (playerPlaying && playerPlaying.idPlayer === 'virtualPlayer') {
            this.virtualPlayerAction(game, playerPlaying);
        }
        // update board tiles to old
        this.updateOldTiles(game);
    }

    generateNameOpponent(game: GameServer, nameFree: string): string {
        const namesAlrdyUsed: string[] = [];
        for (const player of game.mapPlayers.values()) {
            // we don't add the name that is going to be delete because this is the old player
            if (player.name === nameFree) {
                continue;
            }
            namesAlrdyUsed.push(player.name);
        }
        const nbVPNames = this.databaseService.namesVP.length;
        const randomNumber = this.giveRandomNbOpponent(nbVPNames);
        for (let i = 0; i < nbVPNames; i++) {
            const randomIdx = (randomNumber + i) % nbVPNames;
            const newName: string = this.databaseService.namesVP[randomIdx].firstName + ' ' + this.databaseService.namesVP[randomIdx].lastName;
            if (!namesAlrdyUsed.includes(newName)) {
                return newName;
            }
        }
        return 'no newNameFound';
    }

    // function that transforms the playerThatLeaves into a virtual player
    replaceHumanByBot(playerThatLeaves: Player, game: GameServer, message: string) {
        // we send to everyone that the player has left and has been replaced by a bot
        this.sendMsgToAllInRoom(game, 'Le joueur ' + playerThatLeaves?.name + message);
        this.sendMsgToAllInRoom(game, GlobalConstants.REPLACEMENT_BY_BOT);

        // we keep the old id to determine later to change the old player's turn or not
        const oldIdPlayer = playerThatLeaves.idPlayer;

        let isChangeTurnNeccesary = false;
        // we check if we will have to change the turn of the player that just left
        if (game.gameStarted) {
            // we change the player turn if it was the player that left's turn
            const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
            if (playerPlaying.idPlayer === oldIdPlayer) {
                isChangeTurnNeccesary = true;
            }
        }
        // we delete the old player
        game.mapPlayers.delete(playerThatLeaves.name);

        // we replace him with the virtual player
        playerThatLeaves.idPlayer = 'virtualPlayer';
        playerThatLeaves.name = this.generateNameOpponent(game, playerThatLeaves.name);
        this.insertInMapIndex(game.idxPlayerPlaying, playerThatLeaves.name, playerThatLeaves, game.mapPlayers);

        // if the game is not started we don't need to change the turn
        // furthermore if we entered here game.idxPlayerPlaying would be -1 so server would crash
        if (isChangeTurnNeccesary) {
            this.changePlayer(game);
        }
    }

    sendMsgToAllInRoom(game: GameServer, message: string) {
        for (const player of game.mapPlayers.values()) {
            player.chatHistory.push({ message, isCommand: false, sender: 'S' });
        }
        for (const spectator of game.mapSpectators.values()) {
            spectator.chatHistory.push({ message, isCommand: false, sender: 'S' });
        }
    }

    // function used to keep the order of elements in the map
    // we need to keep the ordre because otherwise the change of turn would be wrong
    // since it is based on this order
    private insertInMapIndex(index: number, key: string, value: Player, map: Map<string, Player>) {
        const arr = Array.from(map);
        arr.splice(index, 0, [key, value]);
        map.clear();
        arr.forEach(([k, v]) => map.set(k, v));
    }

    private randomActionExpertVP(game: GameServer, player: Player): string {
        let resultCommand = '';

        const choosedMoved = this.expertVPService.generateMoves(game, player);
        if (!choosedMoved) {
            if (game.letterBank.size > GlobalConstants.DEFAULT_NB_LETTER_STAND) {
                const lettersExchanged = this.standService.randomExchangeVP(player, game.letters, game.letterBank, game.vpLevel);
                this.chatService.pushMsgToAllPlayers(game, player.name, '!échanger' + lettersExchanged, true, 'O');
                this.chatService.pushMsgToAllPlayers(game, player.name, GlobalConstants.EXCHANGE_OPPONENT_CMD, false, 'O');
                resultCommand = '!échanger ' + lettersExchanged;
            } else {
                this.chatService.passCommand('!passer', game, player);
                resultCommand = '!passer';
            }
        } else {
            resultCommand = '!placer ' + choosedMoved.command + ' ' + choosedMoved.word;
        }

        return resultCommand;
    }

    private virtualPlayerAction(game: GameServer, player: Player) {
        const fourSecondsWait = 4000;
        const intervalId = setInterval(() => {
            if (game.vpLevel === 'expert') {
                this.randomActionExpertVP(game, player);
            } else {
                this.randomActionVP(game, player);
            }

            this.changePlayer(game);
            clearInterval(intervalId);
        }, fourSecondsWait);
    }

    private updateStandAndReserveView(game: GameServer, player: Player) {
        player.nbLetterStand = this.standService.checkNbLetterOnStand(player);
        game.nbLetterReserve = this.letterBankService.getNbLettersInLetterBank(game.letterBank);
    }

    private randomActionVP(game: GameServer, player: Player): string {
        const neinyPercent = 0.9;
        const tenPercent = 0.1;
        const probaMove: number = this.giveProbaMove();
        let resultCommand = '';

        if (probaMove < tenPercent) {
            // 10% change to change letters
            if (this.letterBankService.getNbLettersInLetterBank(game.letterBank) < GlobalConstants.DEFAULT_NB_LETTER_STAND) {
                this.chatService.passCommand('!passer', game, player);
                resultCommand = '!passer';
            } else {
                const lettersExchanged = this.standService.randomExchangeVP(player, game.letters, game.letterBank, game.vpLevel);
                this.chatService.pushMsgToAllPlayers(game, player.name, '!échanger ' + lettersExchanged, true, 'O');
                resultCommand = '!échanger ' + lettersExchanged;
            }
        } else if (probaMove < neinyPercent) {
            // 80% chances to place a letter
            const choosedMoved = this.virtualPService.generateMoves(game, player);
            if (choosedMoved) {
                resultCommand = '!placer ' + choosedMoved.command + ' ' + choosedMoved.word;
            }
        } else {
            this.chatService.passCommand('!passer', game, player);
            resultCommand = '!passer';
        }

        return resultCommand;
    }

    private giveProbaMove(): number {
        const returnValue: number = Math.random();
        return returnValue;
    }

    private updateOldTiles(game: GameServer) {
        const board = game.board;
        board.forEach((line) => {
            line.forEach((tile) => {
                if (tile.letter !== undefined) {
                    if (tile.letter.value !== '' && !tile.old) {
                        tile.old = true;
                    }
                }
            });
        });
    }

    private triggerTimer(game: GameServer) {
        this.sio.to(game.roomName).emit('startClearTimer', {
            minutesByTurn: game.minutesByTurn,
            currentNamePlayerPlaying: Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].name,
        });
    }

    private sendGameToAllClientInRoom(game: GameServer) {
        // We send to all clients a gameState and a scoreBoardState\
        this.sio.to(game.roomName).emit('gameBoardUpdate', game);

        // we send to all clients an update of the players and spectators
        this.sio.to(game.roomName).emit('playersSpectatorsUpdate', {
            roomName: game.roomName,
            players: Array.from(game.mapPlayers.values()),
            spectators: Array.from(game.mapSpectators.values()),
        });

        // we send an update of the player object for each respective client
        for (const player of game.mapPlayers.values()) {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('playerAndStandUpdate', player);
        }
    }

    private triggerStopTimer(roomName: string) {
        this.sio.to(roomName).emit('stopTimer');
        this.sio.to(roomName).emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
    }

    private giveRandomNbOpponent(sizeArrayVPOptions: number): number {
        return Math.floor(Math.random() * sizeArrayVPOptions);
    }
}
