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
        this.placeGraphicService.tileClickedFromStand = true;
        return this.placeGraphicService.getClikedStandTile(event.offsetX);
    }

    onMouseDownGetBoardTile(event: MouseEvent) : Tile | undefined{
        this.placeGraphicService.tileClickedFromStand = false;
        return this.placeGraphicService.getClikedBoardTile({x: event.offsetX, y: event.offsetY});
    }

    //function that get the index of a pixel position mouse up
    //and send ask the server to place the tile as a temporary one
    onStandToBoardDrop(coordsClick: Vec2, tileDropped: Tile) {
        //indexs of the tile where the "tileDropped" has been dropped
        const posDropBoardIdxs : Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        //if the tile on which we drop the new one is an old one (from a precedent turn)
        //we do nothing
        if(this.infoClientService.game?.board[posDropBoardIdxs.y][posDropBoardIdxs.x].old){
            return;
        }
        
        if (!this.drawingBoardService.lettersDrawn) {
            this.placeGraphicService.placeMethodIsDragDrop = true;
            this.placeGraphicService.startLettersPlacedPosX = posDropBoardIdxs.x;
            this.placeGraphicService.startLettersPlacedPosY = posDropBoardIdxs.y;
            console.log("INIT startLettersPlacedPosX: " + this.placeGraphicService.startLettersPlacedPosX);
            console.log("INIT startLettersPlacedPosY: " + this.placeGraphicService.startLettersPlacedPosY);
        }
        this.drawingBoardService.lettersDrawn += tileDropped.letter.value;
        this.drawingBoardService.coordsLettersDrawn.push(posDropBoardIdxs);
        console.log("coordsLettersDrawn: " + this.drawingBoardService.coordsLettersDrawn);
        //remove the tile from the stand logically and visually
        this.socketService.socket.emit("rmTileFromStand", tileDropped);
        //ask for update board logic for a temporary tile
        this.socketService.socket.emit('addTempLetterBoard', 
            tileDropped.letter.value, 
            posDropBoardIdxs.x, 
            posDropBoardIdxs.y);
        console.log("this.drawingBoardService.lettersDrawn", this.drawingBoardService.lettersDrawn)
    }

    onBoardToBoardDrop(coordsClick: Vec2, tileDropped: Tile){
        console.log("onBoardToBoardDrop");
        //indexs of the tile where the "tileDropped" has been dropped
        const posDropBoardIdxs : Vec2 = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        
        //if the tile on which we drop the new one is an old one (from a precedent turn)
        //we do nothing
        if(this.infoClientService.game?.board[posDropBoardIdxs.y][posDropBoardIdxs.x].old){
            return;
        }

        //indexs of the "tileDropped" variable on the board
        const posClickedTileIdxs : Vec2 = 
        this.drawingBoardService.getIndexOnBoardLogicFromClick({
            x: tileDropped.position.x1, 
            y: tileDropped.position.y1,
        });

        //if the tile on which we drop the new one is the same tile we do nothing
        if(posClickedTileIdxs.x === posDropBoardIdxs.x && posClickedTileIdxs.y === posDropBoardIdxs.y){
            return;
        }
        //ask for update board logic for a move of temporary tile
        this.socketService.socket.emit('onBoardToBoardDrop', 
            posClickedTileIdxs,
            posDropBoardIdxs,
        );
    }

    onBoardToStandDrop(coordsClick: Vec2, tileDropped: Tile, originalClickTileIndexs: Vec2) {
        console.log("onBoardToStandDrop");
        //if the letter taken from the board isn't one taken from the stand
        //we do nothing
        if(!this.drawingBoardService.lettersDrawn.includes(tileDropped.letter.value)){
            return;
        }

        //gets the index of the letterDrawn array to remove
        const idxToRm = this.checkIdxToRm(originalClickTileIndexs);
        console.log("letterDrawn", this.drawingBoardService.lettersDrawn);
        console.log("idxToRm", idxToRm);
        //remove the letter from the lettersDrawn array
        this.drawingBoardService.lettersDrawn = 
            this.drawingBoardService.lettersDrawn.slice(0, idxToRm) 
          + this.drawingBoardService.lettersDrawn.slice(idxToRm + 1, this.drawingBoardService.lettersDrawn.length)
        console.log("letterDrawn2", this.drawingBoardService.lettersDrawn);
        const standIdx: number = this.drawingService.getIndexOnStandLogicFromClick(coordsClick.x);
        this.socketService.socket.emit("clearTmpTileCanvas");
        this.socketService.socket.emit("onBoardToStandDrop", tileDropped, standIdx);
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

        if(this.drawingBoardService.lettersDrawn === ""){
            this.placeGraphicService.placeMethodIsDragDrop = false;
        }

        if (this.infoClientService.isTurnOurs) {
            if (this.drawingBoardService.lettersDrawn) {
                return;
            }
            this.drawingBoardService.findTileToPlaceArrow(
                this.socketService.socket,
                coordsClick, 
                this.infoClientService.game.board, 
                this.infoClientService.game.bonusBoard
            );
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

    //function to check which letter to remove from the lettersDrawn array
    //in this function, one of the two diff or both will be 0 bc one axis doesn't change
    //the other axis that changes is the one that interest us bc it's the one that
    //give the index of the letter in the lettersDrawn array to remove
    private checkIdxToRm(originalClickTileIndexs: Vec2){
        const xDiff = originalClickTileIndexs.x - this.placeGraphicService.startLettersPlacedPosX;
        const yDiff = originalClickTileIndexs.y - this.placeGraphicService.startLettersPlacedPosY;
        return xDiff > yDiff ? xDiff : yDiff;
    }
}
