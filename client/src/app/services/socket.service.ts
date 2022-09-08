import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
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

    private playerUpdateCallBack(player: Player) {
        this.infoClientService.player = player;
        this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
    }

    private gameUpdateHandler() {
        this.socket.on('playerUpdate', (player) => this.playerUpdateCallBack(player));

        this.socket.on('gameUpdateClient', ({ game, player, scoreOpponent, nbLetterStandOpponent }) => {
            console.log("game 1");
            console.log(game);
            this.infoClientService.game = game;
            this.infoClientService.player = player;
            this.infoClientService.scoreOpponent = scoreOpponent;
            this.infoClientService.nbLetterStandOpponent = nbLetterStandOpponent;
            const savedFont: string = this.drawingBoardService.boardCanvas.font;
            this.drawingBoardService.reDrawBoard(game.bonusBoard, game.board, this.infoClientService.letterBank);
            this.drawingBoardService.boardCanvas.font = savedFont;

            this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
            if (game.currentPlayerId !== this.socket.id) {
                this.drawingService.resetColorTileStand(player, this.infoClientService.letterBank);
            }
        });

        this.socket.on('gameInit', ({ roomName, game, player }) => {
            console.log("game 2");
            console.log(game);
            setTimeout(() => {
                this.infoClientService.actualRoom = roomName;
                this.infoClientService.game = game;
                this.infoClientService.player = player;
                if (this.infoClientService.displayTurn === "C'est votre tour !") {
                    this.infoClientService.game.currentPlayerId = this.socket.id;
                }
                this.drawingBoardService.drawBoardInit(game.bonusBoard);
                this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
            }, GlobalConstants.WAIT_FOR_CANVAS_INI);
        }); 

        this.socket.on('gameBoardUpdate', (game) => {
            this.infoClientService.game = game;
            setTimeout(() => {
                this.drawingBoardService.reDrawBoard(game.bonusBoard, game.board, this.infoClientService.letterBank);
            }, GlobalConstants.WAIT_FOR_CANVAS_INI);
        });

        //TODO U STOPPED HERE BOI
        this.socket.on('infoPannelUpdate', ({ playerNames, playerScores }) => {
            this.infoClientService.playerNames = playerNames;
            this.infoClientService.playerScores = playerScores;
            console.log("playerNames: " + playerNames);
            console.log("playerScores: " + playerScores);
        });

        this.socket.on('sendStand', (player) => {
            this.infoClientService.player = player;
            this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
        });
        this.socket.on('nameOpponentUpdate', (nameOpponent) => {
            this.infoClientService.nameOpponent = nameOpponent;
        });
        this.socket.on('findTileToPlaceArrow', (realPosInBoardPx) => {
            this.drawingBoardService.findTileToPlaceArrow(
                realPosInBoardPx,
                this.infoClientService.game.board,
                this.infoClientService.game.bonusBoard,
            );
        });
    }

    private displayChangeEndGameCallBack(displayChange: string) {
        this.infoClientService.displayTurn = displayChange;
    }

    private timerHandler() {
        this.socket.on('displayChangeEndGame', (displayChange) => this.displayChangeEndGameCallBack(displayChange));

        this.socket.on('startClearTimer', ({ minutesByTurn, currentPlayerId }) => {
            if (currentPlayerId === this.socket.id) {
                this.infoClientService.displayTurn = "C'est votre tour !";
            } else {
                //TODO: change this to the name of the opponent for the spectator
                this.infoClientService.displayTurn = "C'est au tour de votre adversaire !";
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
                                                isLog2990Enabled , nbPlayers, nbSpectators}) => {
            const idxExistingRoom = this.infoClientService.rooms.findIndex((element) => element.name === roomName);
            console.log("nbPlayers: " + nbPlayers);
            console.log("nbSpectators: " + nbSpectators);
            if ( idxExistingRoom === GlobalConstants.DEFAULT_VALUE_NUMBER) {
                console.log("1");
                this.infoClientService.rooms.push(new RoomData(roomName, timeTurn, isBonusRandom, 
                                                               isLog2990Enabled, nbPlayers, nbSpectators));
            }else{
                console.log("2");
                this.infoClientService.rooms[idxExistingRoom].nbPlayers = nbPlayers;
                this.infoClientService.rooms[idxExistingRoom].nbSpectators = nbSpectators;
            }
        });

        this.socket.on('removeElementListRoom', (roomNameToDelete) => {
            this.infoClientService.rooms = this.infoClientService.rooms.filter((room) => room.name !== roomNameToDelete);
        });

        this.socket.on('roomChangeAccepted', ({ roomName, page }) => {
            this.infoClientService.actualRoom = roomName;
            this.router.navigate([page]);
        });

        this.socket.on('isSpectator', (isSpectator) => {
            this.infoClientService.isSpectator = isSpectator;
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
}
