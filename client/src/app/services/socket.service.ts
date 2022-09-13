import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { TimerService } from './timer.service';

@Injectable({
    providedIn: 'root',
})
export class SocketService {
    socket: Socket;
    private urlString = environment.serverUrl;

    constructor(
        private router: Router,
        private infoClientService: InfoClientService,
        private drawingBoardService: DrawingBoardService,
        private timerService: TimerService,
        private drawingService: DrawingService,
    ) {
        this.socket = io(this.urlString);
        this.socketListen();
    }

    private socketListen() {
        this.roomManipulationHandler();
        this.otherSocketOn();
        this.gameUpdateHandler();
        this.timerHandler();
    }

    private gameUpdateHandler() {
        this.socket.on('playerAndStandUpdate', (player) => {
            this.infoClientService.player = player;
            setTimeout(() => {
                this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
            }, GlobalConstants.WAIT_FOR_CANVAS_INI);
        });

        this.socket.on('gameBoardUpdate', (game) => {
            this.infoClientService.game = game;
            setTimeout(() => {
                this.drawingBoardService.reDrawBoard(game.bonusBoard, game.board, this.infoClientService.letterBank);
            }, GlobalConstants.WAIT_FOR_CANVAS_INI);
        });

        //updates the players and spectators list for each rooms 
        this.socket.on('playersSpectatorsUpdate', ({roomName, players, spectators}) => {
            //gets the room used by the client and stores it for ez access
            const idxExistingRoom = this.infoClientService.rooms.findIndex((element) => element.name === roomName);
            this.infoClientService.actualRoom = this.infoClientService.rooms[idxExistingRoom];
            //update the players and spectators of the room
            this.infoClientService.rooms[idxExistingRoom].players = players;
            this.infoClientService.rooms[idxExistingRoom].spectators = spectators;

            //update the player object locally 
            //(this object is here to access easily the player's data)
            let tmpPlayer = this.infoClientService.actualRoom.players?.find(
                player => player.name === this.infoClientService.playerName);
            if(tmpPlayer){
                this.infoClientService.player = tmpPlayer;
            }

            //useful when spectators connect in middle of game
            //update the name of the person playing for the spectator
            //TODO doesn't update the timer for the spectator
            this.updateUiForSpectator(this.infoClientService.game);
            //update display turn to show that we are waiting for creator or other players
            if(!this.infoClientService.game.gameStarted){
                this.updateUiBeforeStartGame(players);
            }
        });
        
        this.socket.on('findTileToPlaceArrow', (realPosInBoardPx) => {
            this.drawingBoardService.findTileToPlaceArrow(
                realPosInBoardPx,
                this.infoClientService.game.board,
                this.infoClientService.game.bonusBoard,
            );
        });

        this.socket.on('creatorShouldBeAbleToStartGame', () => {
            this.infoClientService.creatorShouldBeAbleToStartGame = true;
        });

        //for now this socket is only used when the player doesn't put a valid word on the board
        //we don't want to explicitly switch the playeer's turn so we control his actions
        //by settings this variable to true (see server side in comm-box service)
        this.socket.on('changeIsTurnOursStatus', (isTurnOurs) => {
            this.infoClientService.isTurnOurs = isTurnOurs;
        });
    }

    private displayChangeEndGameCallBack(displayChange: string) {
        this.infoClientService.displayTurn = displayChange;
    }

    private timerHandler() {
        this.socket.on('displayChangeEndGame', (displayChange) => this.displayChangeEndGameCallBack(displayChange));

        this.socket.on('startClearTimer', ({ minutesByTurn, currentNamePlayerPlaying }) => {
            if (currentNamePlayerPlaying === this.infoClientService.playerName){
                this.infoClientService.displayTurn = "C'est votre tour !";
                this.infoClientService.isTurnOurs = true;
            } else {
                const playerPlaying = this.infoClientService.actualRoom.players.find((player) => player.name === currentNamePlayerPlaying);
                this.infoClientService.displayTurn = "C'est au tour de " + playerPlaying?.name + " de jouer !";
                this.infoClientService.isTurnOurs = false;
            }
            this.timerService.clearTimer();
            this.timerService.startTimer(minutesByTurn);
        });

        this.socket.on('setTimeoutTimerStart', () => {
            this.setTimeoutForTimer();
        });

        this.socket.on('stopTimer', () => {
            this.timerService.clearTimer();
        });
    }

    private roomManipulationHandler() {
        this.socket.on('addElementListRoom', ({ roomName, timeTurn, isBonusRandom, 
                                                isLog2990Enabled , players, spectators}) => {
            const idxExistingRoom = this.infoClientService.rooms.findIndex((element) => element.name === roomName);
            if (idxExistingRoom === GlobalConstants.DEFAULT_VALUE_NUMBER) {
                this.infoClientService.rooms.push(new RoomData(roomName, timeTurn, isBonusRandom, 
                                                               isLog2990Enabled, players, spectators));
            }else{
                this.infoClientService.rooms[idxExistingRoom].players = players;
                this.infoClientService.rooms[idxExistingRoom].spectators = spectators;
            }
        });

        this.socket.on('removeElementListRoom', (roomNameToDelete) => {
            this.infoClientService.rooms = this.infoClientService.rooms.filter((room) => room.name !== roomNameToDelete);
        });

        this.socket.on('roomChangeAccepted', (page) => {
            this.router.navigate([page]);
        });
    }

    private otherSocketOn() {
        this.socket.on('messageServer', (message) => {
            alert(message);
        });
        this.socket.on('SendDictionariesToClient', (dictionaries: MockDict[]) => {
            this.infoClientService.dictionaries = dictionaries;
        });

        this.socket.on('DictionaryDeletedMessage', (message: string) => {
            alert(message);
        });

        this.socket.on('SendBeginnerVPNamesToClient', (namesVP: NameVP[]) => {
            this.infoClientService.nameVPBeginner = namesVP;
        });

        this.socket.on('SendExpertVPNamesToClient', (namesVP: NameVP[]) => {
            this.infoClientService.nameVPExpert = namesVP;
        });

        this.socket.on('isSpectator', (isSpectator) => {
            this.infoClientService.isSpectator = isSpectator;
        });
    }

    private setTimeoutForTimer() {
        const oneSecond = 990;
        const timerInterval = setInterval(() => {
            if (this.timerService.secondsValue <= 0 && this.infoClientService.game.masterTimer === this.socket.id) {
                this.socket.emit('turnFinished');
            }
            if (this.infoClientService.game.gameFinished) {
                clearInterval(timerInterval);
            }
        }, oneSecond);
    }

    private updateUiForSpectator(game: GameServer){
        if(!this.infoClientService.isSpectator || !this.infoClientService.game.gameStarted ||
            this.infoClientService.game.gameFinished || game.idxPlayerPlaying < 0){
            return;
        }

        const playerPlaying = this.infoClientService.actualRoom.players[game.idxPlayerPlaying];
        this.infoClientService.displayTurn = "C'est au tour de " + playerPlaying?.name + " de jouer !";
    }

    private updateUiBeforeStartGame(players: Player[]){
        const nbRealPlayer = players?.filter((player : Player) => player.idPlayer !== 'virtualPlayer').length;
        if(nbRealPlayer >= GlobalConstants.MIN_PERSON_PLAYING) {
            this.infoClientService.displayTurn = GlobalConstants.WAITING_FOR_CREATOR;
        }else{
            this.infoClientService.displayTurn = GlobalConstants.WAIT_FOR_OTHER_PLAYERS;
        }
    }
}
