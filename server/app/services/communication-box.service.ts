import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { PutLogicService } from '@app/services/put-logic.service';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { ObjectiveService } from './objective.service';
import { PlayAreaService } from './play-area.service';

@Service()
export class CommunicationBoxService {
    constructor(
        private chatService: ChatService,
        private putLogicService: PutLogicService,
        private playAreaService: PlayAreaService,
        private objectiveService: ObjectiveService,
    ) {}

    // function that shows the content of the input, place it in the array of message then delte the input field
    onEnter(game: GameServer, player: Player, input: string): boolean {
        const dataSeparated = input.split(' ');

        switch (dataSeparated[0]) {
            case '!placer': {
                if (!this.chatService.sendMessage(input, game, player)) {
                    return false;
                }
                if (this.putLogicService.computeWordToDraw(game, player, dataSeparated[1], dataSeparated[2])) {
                    // We change the turn if word is valid
                    this.playAreaService.changePlayer(game);
                } else {
                    //word isn't valid
                    //pops the msg that shoulnd't have beent sent
                    //TODO maybe just don't send send at all ??
                    for(let playerElem of game.mapPlayers.values()){
                        //poping the msg "PlayerName: !placer pos foo"
                        playerElem.chatHistory.pop();
                        if(playerElem.name === player.name){
                            //poping the msg "Vous avez placé vos lettres"
                            playerElem.chatHistory.pop();
                            playerElem.chatHistory.push({ 
                                message: GlobalConstants.WORD_DOESNT_EXIST, 
                                isCommand: false, sender: 'S' });
                        }
                    }

                    for(let spectator of game.mapSpectators.values()){
                        spectator.chatHistory.pop();
                    }
                    //we don't want to explicitly switch the player's turn for now 
                    //bc it the following timeout would make problems so we control his actions
                    this.playAreaService.sio.sockets.sockets.get(player.idPlayer)?.emit('changeIsTurnOursStatus', false);

                    // timeout bc this is the time before the letter are back to the player
                    setTimeout(() => {
                        //sending to the player and spectators in the game that the player
                        //tried a word
                        for(let playerElem of game.mapPlayers.values()){
                            if(playerElem.name === player.name){
                                continue;
                            }
                            playerElem.chatHistory.push({ 
                                message: "Le joueur " + player.name + 
                                        GlobalConstants.PLAYER_TRIED_A_WORD, 
                                isCommand: false, sender: 'S' });
                        }
                        for(let spectator of game.mapSpectators.values()){
                            spectator.chatHistory.push({ 
                                message: "Le joueur " + player.name + 
                                        GlobalConstants.PLAYER_TRIED_A_WORD, 
                                isCommand: false, sender: 'S' });
                        }
                        //remove the word from the board bc it isn't valid
                        this.putLogicService.boardLogicRemove(game, dataSeparated[1], dataSeparated[2]);
                        //switch the turn of the player
                        this.playAreaService.changePlayer(game);
                    }, GlobalConstants.TIME_DELAY_RM_BAD_WORD);
                    return false;
                }
                break;
            }
            case '!échanger': {
                if (this.chatService.sendMessage(input, game, player)) {
                    this.putLogicService.computeWordToExchange(game, player, dataSeparated[1]);
                    // We check if an objective has been completed
                    const playerThatJustPlayed =  Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
                    if (playerThatJustPlayed && game.isLog2990Enabled) {
                        this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
                    }
                    // We change the turn
                    this.playAreaService.changePlayer(game);
                }
                break;
            }
            case '!passer': {
                if (this.chatService.sendMessage(input, game, player)) {
                    // We check if an objective has been completed
                    const playerThatJustPlayed =  Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
                    if (playerThatJustPlayed && game.isLog2990Enabled) {
                        this.objectiveService.isPlayerObjectivesCompleted(game, playerThatJustPlayed, input);
                    }
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
}
