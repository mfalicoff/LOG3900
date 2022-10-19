import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';
import { PutLogicService } from '@app/services/put-logic.service';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';

@Service()
export class CommunicationBoxService {
    constructor(
        private chatService: ChatService,
        private putLogicService: PutLogicService,
        private playAreaService: PlayAreaService,
        private standService: StandService,
        private boardService: BoardService,
    ) {}

    // function that shows the content of the input, place it in the array of message then delte the input field
    onEnterPlayer(game: GameServer, player: Player, input: string): boolean {
        const dataSeparated = input.split(' ');

        // checking if msg is a command of not
        // we don't want commands until the game is started
        if (dataSeparated[0][0] === '!' && !game.gameStarted) {
            player?.chatHistory.push({
                message: GlobalConstants.GAME_NOT_STARTED,
                isCommand: false,
                sender: 'S',
            });
            return false;
        }

        switch (dataSeparated[0]) {
            case '!placer': {
                if (!this.chatService.sendMessage(input, game, player)) {
                    // if there is a problem with the message we the letters to the stand
                    // and delete them from the board
                    const letterNotWellUsed = this.boardService.rmTempTiles(game);
                    this.standService.putLettersOnStand(game, letterNotWellUsed, player);
                    return false;
                }
                if (this.putLogicService.computeWordToDraw(game, player, dataSeparated[1], dataSeparated[2])) {
                    // We change the turn if word is valid
                    this.playAreaService.changePlayer(game);
                } else {
                    // word isn't valid
                    // pops the msg that shoulnd't have beent sent
                    for (const playerElem of game.mapPlayers.values()) {
                        // poping the msg "PlayerName: !placer pos foo"
                        playerElem.chatHistory.pop();
                        if (playerElem.name === player.name) {
                            // poping the msg "Vous avez placé vos lettres"
                            playerElem.chatHistory.pop();
                            playerElem.chatHistory.push({
                                message: GlobalConstants.WORD_DOESNT_EXIST,
                                isCommand: false,
                                sender: 'S',
                            });
                        }
                    }

                    for (const spectator of game.mapSpectators.values()) {
                        spectator.chatHistory.pop();
                    }
                    // we don't want to explicitly switch the player's turn for now
                    // bc it the following timeout would make problems so we control his actions
                    this.playAreaService.sio.sockets.sockets.get(player.idPlayer)?.emit('changeIsTurnOursStatus', false);

                    // timeout bc this is the time before the letter are back to the player
                    setTimeout(() => {
                        // sending to the player and spectators in the game that the player
                        // tried a word
                        for (const playerElem of game.mapPlayers.values()) {
                            if (playerElem.name === player.name) {
                                continue;
                            }
                            playerElem.chatHistory.push({
                                message: 'Le joueur ' + player.name + GlobalConstants.PLAYER_TRIED_A_WORD,
                                isCommand: false,
                                sender: 'S',
                            });
                        }
                        for (const spectator of game.mapSpectators.values()) {
                            spectator.chatHistory.push({
                                message: 'Le joueur ' + player.name + GlobalConstants.PLAYER_TRIED_A_WORD,
                                isCommand: false,
                                sender: 'S',
                            });
                        }
                        // remove the word from the board bc it isn't valid
                        this.putLogicService.boardLogicRemove(game, dataSeparated[1], dataSeparated[2]);
                        // puts the letters back to the player's stand
                        this.standService.putLettersOnStand(game, dataSeparated[2], player);
                        // send game state to clients
                        this.putLogicService.sendGameToAllClientInRoom(game);
                        // switch the turn of the player
                        this.playAreaService.changePlayer(game);
                    }, GlobalConstants.TIME_DELAY_RM_BAD_WORD);
                    return false;
                }
                break;
            }
            case '!échanger': {
                if (this.chatService.sendMessage(input, game, player)) {
                    this.putLogicService.computeWordToExchange(game, player, dataSeparated[1]);
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!passer': {
                if (this.chatService.sendMessage(input, game, player)) {
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!reserve': {
                if (this.chatService.sendMessage(input, game, player) && player.debugOn) {
                    this.chatService.printReserveStatus(game, player);
                }
                break;
            }
            default: {
                this.chatService.sendMessage(input, game, player);
            }
        }
        return true;
    }
    onEnterSpectator(game: GameServer, spec: Spectator, input: string) {
        if (this.chatService.validator.entryIsTooLong(input)) {
            // verify the length of the command
            spec.chatHistory.push({
                message: GlobalConstants.INVALID_LENGTH,
                isCommand: false,
                sender: 'S',
            });
            return;
        }
        this.chatService.pushMsgToAllPlayers(game, spec.name, input, false, 'P');
    }
}
