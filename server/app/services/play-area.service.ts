import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { DatabaseService } from './database.service';
import { ExpertVP } from './expert-virtual-player.service';
import { LetterBankService } from './letter-bank.service';
import { ObjectiveService } from './objective.service';
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
        private objectiveService: ObjectiveService,
        private databaseService: DatabaseService,
    ) {
        this.sio = new io.Server();
    }

    initSioPlayArea(sio: io.Server) {
        this.sio = sio;
    }

    changePlayer(game: GameServer) {
        // Update les tiles du board en old
        this.updateOldTiles(game);
        const playerThatJustPlayed = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];

        if (playerThatJustPlayed) {
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

        //init the stand for each player
        for(let player of game.mapPlayers.values()){
            this.standService.onInitStandPlayer(game.letters, game.letterBank, player);
        }

        // determine the first player to play and also set this player to the master time
        // (reminder: the master time is the player that controls the timer for the game)
        let keys = Array.from(game.mapPlayers.keys());
        game.idxPlayerPlaying = Math.floor(Math.random() * game.mapPlayers.size);
        
        //we set the master timer, it has to be a human client not a virtual player
        //gets rid of the virtual player
        //TODO probably is a better way to do this lul
        keys = keys.filter((key) => key !== 'virtualPlayer');
        game.masterTimer = keys[Math.floor(Math.random() * game.mapPlayers.size - (game.mapPlayers.size - keys.length))];

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
        let namesAlrdyUsed : string[] = [];
        for(let player of game.mapPlayers.values()){
            //we don't add the name that is going to be delete because this is the old player
            if(player.name === nameFree){
                continue;
            }
            namesAlrdyUsed.push(player.name);
        }

        const nbVPNames = this.databaseService.namesVP.length;
        let randomNumber = this.giveRandomNbOpponent(nbVPNames);
        let newName : string = this.databaseService.namesVP[randomNumber].firstName + " "  
                             + this.databaseService.namesVP[randomNumber].lastName;
        while (namesAlrdyUsed.indexOf(newName) <= -1) {
            if (randomNumber === nbVPNames - 1) {
                randomNumber--;
            } else {
                randomNumber++;
            }
        }
        return newName;
    }

    //function that transforms the playerThatLeaves into a virtual player
    replaceHumanByBot(playerThatLeaves: Player, game: GameServer, message: string) {
        // we send to everyone that the player has left and has been replaced by a bot
        
        this.sendMsgToAllInRoom(game, 'Le joueur ' + playerThatLeaves?.name + message);
        this.sendMsgToAllInRoom(game, GlobalConstants.REPLACEMENT_BY_BOT);

        const oldIdPlayer = playerThatLeaves.idPlayer;

        playerThatLeaves.idPlayer = 'virtualPlayer';
        playerThatLeaves.name = this.generateNameOpponent(game, playerThatLeaves.name);

        // we delete the old player and replacer him with the virtual player
        game.mapPlayers.delete(oldIdPlayer);
        game.mapPlayers.set(playerThatLeaves.idPlayer, playerThatLeaves);

        // we change the player turn if it was the player that left's turn
        const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
        if (playerPlaying.idPlayer === oldIdPlayer) {
            this.changePlayer(game);
        }
    }

    sendMsgToAllInRoom(game: GameServer, message: string) {
        for(let player of game.mapPlayers.values()){
            player.chatHistory.push({ message: message, isCommand: false, sender: 'S' });
        }
        for(let spectator of game.mapSpectators.values()){
            spectator.chatHistory.push({ message: message, isCommand: false, sender: 'S' });
        }
    }

    private randomActionExpertVP(game: GameServer, player: Player): string {
        let resultCommand = '';

        const choosedMoved = this.expertVPService.generateMoves(game, player);
        if (!choosedMoved) {
            if (game.letterBank.size > GlobalConstants.DEFAULT_NB_LETTER_STAND) {
                const lettersExchanged = this.standService.randomExchangeVP(player, game.letters, game.letterBank, game.vpLevel);
                this.chatService.pushMsgToAllPlayers(game, player.name, "!échanger" + lettersExchanged, true, 'O');
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
        let resultCommand = '';

        const intervalId = setInterval(() => {
            if (game.vpLevel === 'expert') {
                resultCommand = this.randomActionExpertVP(game, player);
            } else {
                resultCommand = this.randomActionVP(game, player);
            }

            if (player && game.isLog2990Enabled) {
                this.objectiveService.isPlayerObjectivesCompleted(game, player, resultCommand);
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
                this.chatService.pushMsgToAllPlayers(game, player.name, "!échanger " + lettersExchanged, true, 'O');
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
            currentPlayerId: Array.from(game.mapPlayers.values())[game.idxPlayerPlaying].idPlayer,
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
        for(const player of game.mapPlayers.values()){
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('playerAndStandUpdate', player);
        }
    }

    private triggerStopTimer(roomName: string) {
        this.sio.to(roomName).emit('stopTimer');
        this.sio.to(roomName).emit('displayChangeEndGame', GlobalConstants.END_GAME_DISPLAY_MSG);
    }

    private giveRandomNbOpponent(sizeArrayVPOptions: number): number {
        const returnValue = Math.floor(Math.random() * sizeArrayVPOptions);
        return returnValue;
    }
}
