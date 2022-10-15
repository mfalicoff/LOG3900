import { Injectable } from '@angular/core';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from './drawing-board-service';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';
import { SocketService } from './socket.service';
const DEFAULT_VALUE_INDEX = -1;

@Injectable({
    providedIn: 'root',
})
export class PlaceGraphicService {
    startLettersPlacedPosX: number;
    startLettersPlacedPosY: number;
    placeMethodIsDragDrop: boolean;
    //variable used to tell if a clicked tile comes from the stand or
    //the board
    tileClickedFromStand: boolean;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private socketService: SocketService,
        private drawingService: DrawingService,
        private infoClientService: InfoClientService,
    ) {
        this.startLettersPlacedPosX = 0;
        this.startLettersPlacedPosY = 0;
        this.placeMethodIsDragDrop = false;
        this.tileClickedFromStand = false;
    }

    manageKeyboardEvent(game: GameServer, player: Player, keyEntered: string) {
        if (this.infoClientService.displayTurn !== "C'est votre tour !") {
            return;
        }
        console.log("keyEntered is: " + keyEntered);
        keyEntered = keyEntered.normalize('NFD').replace(/\p{Diacritic}/gu, '');
        switch (keyEntered) {
            case 'Enter': {
                if (!this.drawingBoardService.lettersDrawn) {
                    return;
                }
                const placeMsg: string = this.createPlaceMessage();
                console.log("placeMsg: " + placeMsg);
                this.socketService.socket.emit('newMessageClient', placeMsg);
                this.resetVariablePlacement();
                //TODO remove this line if everything works
                // this.deleteEveryLetterPlacedOnBoard(game, player);
                return;
            }
            case 'Backspace': {
                if (!this.drawingBoardService.lettersDrawn || this.placeMethodIsDragDrop) {
                    return;
                }
                this.deleteLetterPlacedOnBoard(game, player);
                this.drawingBoardService.isArrowPlaced = this.drawingBoardService.lettersDrawn.length !== 0;
                return;
            }
            case 'Escape': {
                console.log("Escape");
                //TODO remove this line if everything works
                // this.deleteEveryLetterPlacedOnBoard(game, player);
                //deletes the arrow and removes all the tmpTiles (pink ones)
                this.socketService.socket.emit("escapeKeyPressed", this.drawingBoardService.lettersDrawn);
                this.resetVariablePlacement();
                return;
            }
        }
        if (
            this.drawingBoardService.arrowPosX > Constants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosY > Constants.NUMBER_SQUARE_H_AND_W
        ) {
            return;
        }
        if (!this.drawingBoardService.lettersDrawn) {
            this.startLettersPlacedPosX = this.drawingBoardService.arrowPosX;
            this.startLettersPlacedPosY = this.drawingBoardService.arrowPosY;
        }
        let letterPos: number;
        if (keyEntered.toUpperCase() === keyEntered) {
            letterPos = this.findIndexLetterInStandForPlacement('*', false, player);
        } else {
            letterPos = this.findIndexLetterInStandForPlacement(keyEntered, false, player);
        }

        if (letterPos === DEFAULT_VALUE_INDEX) {
            return;
        }
        // removes the letter from the stand visually (not in the stand logic)
        // TODO for the spectators, that means that they will not see the letters
        // getting deleting from the stand when placing a temporary word
        // do we care ? It's a bug bug maybe too small to care about
        // to discuss
        // this.drawingService.removeTile(player.stand[letterPos]);
        this.socketService.socket.emit("removeTileFromStand", player.stand[letterPos]);

        const xIndex = this.drawingBoardService.arrowPosX;
        const yIndex = this.drawingBoardService.arrowPosY;

        this.drawContinuousArrow(game, keyEntered);
        this.socketService.socket.emit('addTempLetterBoard', keyEntered, xIndex, yIndex);
    }

    isLettersDrawnSizeAboveZero(): boolean {
        return this.drawingBoardService.lettersDrawn !== '';
    }

    getClikedStandTile(positionX: number) : Tile{
        const finalIndex = this.drawingService.getIndexOnStandLogicFromClick(positionX);
        return this.infoClientService.player.stand[finalIndex];
    }

    getClikedBoardTile(mouseCoords: Vec2): Tile | undefined{
        const idxCoords = this.drawingBoardService.getIndexOnBoardLogicFromClick(mouseCoords);
        if(idxCoords.x === -1 || idxCoords.y === -1){
            return undefined;
        }
        const clickedTile = this.infoClientService.game.board[idxCoords.y][idxCoords.x];
        //if the tile is old it means that this is not a temporary tile and 
        //we don't want to be able to touch it
        if(clickedTile.old){
            return undefined;
        }else{
            return clickedTile;
        }
    }

    private resetVariablePlacement(){
        this.drawingBoardService.lettersDrawn = '';
        this.drawingBoardService.coordsLettersDrawn = [];
        this.drawingBoardService.isArrowPlaced = false;
    }

    private createPlaceMessage(): string {
        const posStartWordX: number = this.startLettersPlacedPosX;
        let posStartWordY: number = this.startLettersPlacedPosY;
        posStartWordY += Constants.ASCII_CODE_SHIFT;
        let placerCmd = '!placer ' + String.fromCodePoint(posStartWordY) + posStartWordX.toString();
        if(this.drawingBoardService.isArrowPlaced){
            console.log("arrow message");
            if (this.drawingBoardService.isArrowVertical) {
                placerCmd += 'v ' + this.drawingBoardService.lettersDrawn;
            } else {
                placerCmd += 'h ' + this.drawingBoardService.lettersDrawn;
            }
        }else{ 
            console.log("NO arrow message");
            if (this.isWordVertical(this.drawingBoardService.coordsLettersDrawn)) {
                placerCmd += 'v ' + this.drawingBoardService.lettersDrawn;
            } else {
                placerCmd += 'h ' + this.drawingBoardService.lettersDrawn;
            }
        }

        return placerCmd;
    }

    private isWordVertical(letterCoords: Vec2[]): boolean {
        if(letterCoords.length === 1){
            if(this.infoClientService.game.board[letterCoords[0].y][letterCoords[0].x - 1].letter.value !== ''||
               this.infoClientService.game.board[letterCoords[0].y][letterCoords[0].x + 1].letter.value !== ''){
                return false;
            }else if(this.infoClientService.game.board[letterCoords[0].y - 1][letterCoords[0].x].letter.value !== ''||
                     this.infoClientService.game.board[letterCoords[0].y + 1][letterCoords[0].x].letter.value !== ''){
                return true;
            }else{
                //eslint-disable-next-line no-console
                console.log("Error1 in PlaceGraphic::isWordVertical");
            }
        }else if(letterCoords.length > 1){
            if(letterCoords[0].x === letterCoords[1].x){
                return true;
            }else{
                return false;
            }
        }else{
            //eslint-disable-next-line no-console
            console.log("Error2 in PlaceGraphic::isWordVertical");
        }
        return false;
    }

    //DELETE THIS LATER IF EVERYTHING WORKS
    // private deleteEveryLetterPlacedOnBoard(game: GameServer, player: Player) {
    //     if (!this.drawingBoardService.lettersDrawn) {
    //         return;
    //     }
    //     const letterDrawnLength: number = this.drawingBoardService.lettersDrawn.length;
    //     for (let i = 0; i < letterDrawnLength; i++) {
    //         this.deleteLetterPlacedOnBoard(game, player);
    //     }
    //     this.drawingBoardService.isArrowVertical = true;
    //     this.drawingBoardService.lettersDrawn = '';
    // }

    private deleteLetterPlacedOnBoard(game: GameServer, player: Player) {
        if (this.drawingBoardService.lettersDrawn === '') {
            return;
        }
        this.checkIfThereAreLettersBefore(game, false);
        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.arrowPosY <= Constants.NUMBER_SQUARE_H_AND_W) {
                this.drawingBoardService.drawTileAtPos(
                    this.drawingBoardService.arrowPosX - 1,
                    game.bonusBoard,
                    this.drawingBoardService.arrowPosY - 1,
                    1,
                ); // erase arrow
            }
            while (game.board[this.drawingBoardService.arrowPosY - 1][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.arrowPosY -= 1;
            }

            this.drawingBoardService.removeTile(game.board[this.drawingBoardService.arrowPosY - 1][this.drawingBoardService.arrowPosX]);

            this.drawingBoardService.drawTileAtPos(
                this.drawingBoardService.arrowPosX - 1,
                game.bonusBoard,
                this.drawingBoardService.arrowPosY - 2,
                1,
            ); // erase tile
        } else {
            if (this.drawingBoardService.arrowPosX <= Constants.NUMBER_SQUARE_H_AND_W) {
                this.drawingBoardService.drawTileAtPos(
                    this.drawingBoardService.arrowPosX - 1,
                    game.bonusBoard,
                    this.drawingBoardService.arrowPosY - 1,
                    1,
                );
            }
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX - 1].old) {
                this.drawingBoardService.arrowPosX -= 1;
            }
            this.drawingBoardService.removeTile(game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX - 1]);
            this.drawingBoardService.drawTileAtPos(
                this.drawingBoardService.arrowPosX - 2,
                game.bonusBoard,
                this.drawingBoardService.arrowPosY - 1,
                1,
            );
        }
        let letterTofind: string = this.drawingBoardService.lettersDrawn[this.drawingBoardService.lettersDrawn.length - 1];
        if (letterTofind.toUpperCase() === letterTofind) {
            letterTofind = '*';
        }
        const letterPos = this.findIndexLetterInStandForPlacement(letterTofind, true, player);
        if (letterPos !== Constants.DEFAULT_VALUE_NUMBER) {
            this.drawingService.drawOneLetter(
                letterTofind,
                player.stand[letterPos],
                this.drawingService.playAreaCanvas,
                this.infoClientService.letterBank,
            );
        }
        this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(0, this.drawingBoardService.lettersDrawn.length - 1);
        if (this.drawingBoardService.isArrowVertical) {
            if (this.drawingBoardService.arrowPosY - 1 === this.startLettersPlacedPosY || this.areAllLettersBeforeOld(game)) {
                this.drawingBoardService.isArrowVertical = true;
                this.drawingBoardService.lettersDrawn = '';
                this.drawingBoardService.arrowPosX = Constants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = Constants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            //TODO delete this if everything works
            // this.drawingBoardService.drawVerticalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY - 1);
            this.socketService.socket.emit("drawVerticalArrow", {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        } else {
            if (this.drawingBoardService.arrowPosX - 1 === this.startLettersPlacedPosX || this.areAllLettersBeforeOld(game)) {
                this.drawingBoardService.isArrowVertical = true;
                this.drawingBoardService.lettersDrawn = '';
                this.drawingBoardService.arrowPosX = Constants.NUMBER_SQUARE_H_AND_W + 1;
                this.drawingBoardService.arrowPosY = Constants.NUMBER_SQUARE_H_AND_W + 1;
                return;
            }
            //TODO delete this if everything works
            // this.drawingBoardService.drawHorizontalArrowDirection(this.drawingBoardService.arrowPosX - 1, this.drawingBoardService.arrowPosY);
            this.socketService.socket.emit("drawHorizontalArrow", {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        }
    }

    private drawContinuousArrow(game: GameServer, keyEntered: string) {
        if (!this.drawingBoardService.lettersDrawn) {
            this.checkIfThereAreLettersBefore(game, true);
        }

        this.drawingBoardService.lettersDrawn += keyEntered;
        this.drawingBoardService.coordsLettersDrawn.push(
            {x: this.drawingBoardService.arrowPosX, y: this.drawingBoardService.arrowPosY});
        if (this.drawingBoardService.isArrowVertical) {
            this.drawingBoardService.arrowPosY += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.lettersDrawn +=
                    game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].letter.value;
                this.drawingBoardService.arrowPosY += 1;
            }
        } else {
            this.drawingBoardService.arrowPosX += 1;
            while (game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].old) {
                this.drawingBoardService.lettersDrawn +=
                    game.board[this.drawingBoardService.arrowPosY][this.drawingBoardService.arrowPosX].letter.value;
                this.drawingBoardService.arrowPosX += 1;
            }
        }
        if (
            this.drawingBoardService.arrowPosY > Constants.NUMBER_SQUARE_H_AND_W ||
            this.drawingBoardService.arrowPosX > Constants.NUMBER_SQUARE_H_AND_W
        ) {
            this.drawingBoardService.isArrowPlaced = false;
            return;
        }
        if (this.drawingBoardService.isArrowVertical) {
            //TODO Delete this if everything works
            // this.drawingBoardService.drawVerticalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY);
            this.socketService.socket.emit("drawVerticalArrow", {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        } else {
            //TODO Delete this if everything works
            // this.drawingBoardService.drawHorizontalArrowDirection(this.drawingBoardService.arrowPosX, this.drawingBoardService.arrowPosY);
            this.socketService.socket.emit("drawHorizontalArrow", {
                x: this.drawingBoardService.arrowPosX,
                y: this.drawingBoardService.arrowPosY,
            });
        }
    }

    private checkIfThereAreLettersBefore(game: GameServer, addToLetterDrawn: boolean) {
        let tmpArrowPosY: number = this.drawingBoardService.arrowPosY;
        let tmpArrowPosX: number = this.drawingBoardService.arrowPosX;
        let tmpLettersFoundBefore = '';
        if (this.drawingBoardService.isArrowVertical) {
            while (game.board[tmpArrowPosY - 1][tmpArrowPosX].old) {
                if (addToLetterDrawn) {
                    tmpLettersFoundBefore += game.board[tmpArrowPosY - 1][tmpArrowPosX].letter.value;
                } else {
                    this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(
                        0,
                        this.drawingBoardService.lettersDrawn.length - 1,
                    );
                }
                tmpArrowPosY -= 1;
                this.startLettersPlacedPosX = tmpArrowPosX;
                this.startLettersPlacedPosY = tmpArrowPosY;
            }
        } else {
            while (game.board[tmpArrowPosY][tmpArrowPosX - 1].old) {
                if (addToLetterDrawn) {
                    tmpLettersFoundBefore += game.board[tmpArrowPosY][tmpArrowPosX - 1].letter.value;
                } else {
                    this.drawingBoardService.lettersDrawn = this.drawingBoardService.lettersDrawn.substr(
                        0,
                        this.drawingBoardService.lettersDrawn.length - 1,
                    );
                }
                tmpArrowPosX -= 1;
                this.startLettersPlacedPosX = tmpArrowPosX;
                this.startLettersPlacedPosY = tmpArrowPosY;
            }
        }
        if (addToLetterDrawn && tmpLettersFoundBefore) {
            for (let i = 0; i < tmpLettersFoundBefore.length; i++) {
                this.drawingBoardService.lettersDrawn += tmpLettersFoundBefore[tmpLettersFoundBefore.length - 1 - i];
                this.drawingBoardService.coordsLettersDrawn.push(
                    {x: this.drawingBoardService.arrowPosX, y: this.drawingBoardService.arrowPosY});
            }
        }
    }

    private findIndexLetterInStandForPlacement(letterToSearch: string, onBoard: boolean, player: Player): number {
        const indexLetterToSearch = -1;
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].letter.value === letterToSearch && player.stand[i].isOnBoard === onBoard) {
                player.stand[i].isOnBoard = !onBoard;
                return i;
            }
        }
        return indexLetterToSearch;
    }

    private areAllLettersBeforeOld(game: GameServer): boolean {
        let tmpArrowPosY: number = this.drawingBoardService.arrowPosY;
        let tmpArrowPosX: number = this.drawingBoardService.arrowPosX;
        let tmpLettersDrawn: string = this.drawingBoardService.lettersDrawn;
        if (this.drawingBoardService.isArrowVertical) {
            while (game.board[tmpArrowPosY - 2][tmpArrowPosX].old) {
                tmpArrowPosY -= 1;
                tmpLettersDrawn = tmpLettersDrawn.substr(0, tmpLettersDrawn.length - 1);
            }
            return tmpLettersDrawn === '';
        } else {
            while (game.board[tmpArrowPosY][tmpArrowPosX - 2].old) {
                tmpArrowPosX -= 1;
                tmpLettersDrawn = tmpLettersDrawn.substr(0, tmpLettersDrawn.length - 1);
            }
            return tmpLettersDrawn === '';
        }
    }
}
