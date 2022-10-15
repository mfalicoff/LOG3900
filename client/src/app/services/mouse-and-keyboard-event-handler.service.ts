import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { DrawingBoardService } from './drawing-board-service';
import { InfoClientService } from './info-client.service';
import { ChatMessage } from '@app/classes/chat-message.interface';
import { Tile } from '@app/classes/tile';
import { DrawingService } from './drawing.service';

@Injectable({
    providedIn: 'root',
})
export class MouseKeyboardEventHandlerService {
    isCommunicationBoxFocus: boolean;
    private isStandClicked: boolean;
    private isCommBoxJustBeenClicked: boolean;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private socketService: SocketService,
        private placeGraphicService: PlaceGraphicService,
        private infoClientService: InfoClientService,
        private drawingService: DrawingService,
    ) {
        this.isCommunicationBoxFocus = false;
        this.isStandClicked = false;
        this.isCommBoxJustBeenClicked = false;
    }

    onMouseDownGetStandTile(event: MouseEvent) : Tile{
        return this.placeGraphicService.getClikedStandTile(event.offsetX);
    }

    //function that get the index of a pixel position mouse up
    //and send ask the server to place the tile as a temporary one
    onBoardTileDrop(coordsClick: Vec2, tileDropped: Tile) {
        const boardIndexs : Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        if (!this.drawingBoardService.lettersDrawn) {
            this.placeGraphicService.startLettersPlacedPosX = boardIndexs.x;
            this.placeGraphicService.startLettersPlacedPosY = boardIndexs.y;
            console.log("INIT startLettersPlacedPosX: " + this.placeGraphicService.startLettersPlacedPosX);
            console.log("INIT startLettersPlacedPosY: " + this.placeGraphicService.startLettersPlacedPosY);
        }
        this.drawingBoardService.lettersDrawn += tileDropped.letter.value;
        this.drawingBoardService.coordsLettersDrawn.push(boardIndexs);
        console.log("coordsLettersDrawn: " + this.drawingBoardService.coordsLettersDrawn);
        //remove the tile from the stand visually
        this.drawingService.removeTile(tileDropped);
        //ask for update board logic for a temporary tile
        this.socketService.socket.emit(
            'addTempLetterBoard', 
            tileDropped.letter.value, 
            boardIndexs.x, 
            boardIndexs.y);
        console.log("this.drawingBoardService.lettersDrawn", this.drawingBoardService.lettersDrawn)
    }

    onLeftClickStand(event: MouseEvent) {
        console.log("onLeftClickStand");

        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isStandClicked = true;
        this.isCommBoxJustBeenClicked = false;

        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('leftClickSelection', coordinateXClick);
    }

    onRightClickStand(event: MouseEvent) {
        console.log("onRightClickStand");
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('rightClickExchange', coordinateXClick);
    }

    onBoardClick(event: MouseEvent) {
        console.log("onClickBoard");
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };

        if (this.infoClientService.isTurnOurs) {
            if (this.drawingBoardService.lettersDrawn) {
                return;
            }
            this.drawingBoardService.findTileToPlaceArrow(coordsClick, this.infoClientService.game.board, this.infoClientService.game.bonusBoard);
        }
    }

    onCommunicationBoxEnter(input: string) {
        this.socketService.socket.emit('newMessageClient', input);
        this.isCommBoxJustBeenClicked = false;
        this.isCommunicationBoxFocus = true;
    }

    onCommunicationBoxEnterChat(chat: ChatMessage) {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('chat msg', chat);
            this.isCommBoxJustBeenClicked = false;
            this.isCommunicationBoxFocus = true;
        } else {
            throw new Error('not connected to server');
        }
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }
        if (this.drawingBoardService.isArrowPlaced || this.drawingBoardService.lettersDrawn) {
            this.placeGraphicService.manageKeyboardEvent(this.infoClientService.game, this.infoClientService.player, event.key);
            return;
        }
        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardSelection', eventString);
    }

    handleArrowEvent(event: KeyboardEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    handleScrollEvent(event: WheelEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.deltaY.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    onLeftClickGamePage() {
        if (!this.isCommBoxJustBeenClicked) {
            this.isCommunicationBoxFocus = false;
        }
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isCommBoxJustBeenClicked = false;
        if (!this.isStandClicked) {
            if (this.drawingBoardService.lettersDrawn !== '') {
                return;
            }
            this.socketService.socket.emit('resetAllTilesStand');
        } else {
            this.isStandClicked = !this.isStandClicked;
        }
        this.isCommBoxJustBeenClicked = false;
    }

    onCommunicationBoxLeftClick() {
        this.isCommBoxJustBeenClicked = true;
        this.isCommunicationBoxFocus = true;
    }
}
