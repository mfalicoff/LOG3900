/* eslint-disable max-lines*/
import { Injectable } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingService } from './drawing.service';
import { InfoClientService } from './info-client.service';

@Injectable({
    providedIn: 'root',
})
export class DrawingBoardService {
    playArea: CanvasRenderingContext2D;
    isArrowVertical: boolean;
    isArrowPlaced: boolean;
    arrowPosX: number;
    arrowPosY: number;
    //lettersDrawn is in fact the letter placed on the board
    //TODO change the name when we have time
    lettersDrawn: string;
    private mapTileColours: Map<string, string>;

    constructor(
        private drawingService: DrawingService,
        private infoClientService: InfoClientService
    ) {
        this.isArrowVertical = false;
        this.isArrowPlaced = false;
        this.arrowPosX = Constants.DEFAULT_VALUE_NUMBER;
        this.arrowPosY = Constants.DEFAULT_VALUE_NUMBER;
        this.lettersDrawn = '';
        this.mapTileColours = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);
    }

    canvasInit(canvas: CanvasRenderingContext2D) {
        this.playArea = canvas;
        this.drawingService.canvasInit(canvas);
    }

    drawBoardInit(bonusBoard: string[][]) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        // we take out the first line and column because they aren't used
        // for the drawing of the board
        bonusBoard.splice(0, 1);
        bonusBoard = this.removeEl(bonusBoard, 0);
        if (this.playArea.font === '10px sans-serif') {
            this.playArea.font = '19px bold system-ui';
        }
        const savedFont = this.playArea.font;
        this.playArea.font = '19px bold system-ui';

        const mapTileColours: Map<string, string> = new Map([
            ['xx', '#BEB9A6'],
            ['wordx3', '#f75d59'],
            ['wordx2', '#fbbbb9'],
            ['letterx3', '#157dec'],
            ['letterx2', '#a0cfec'],
        ]);

        this.playArea.beginPath();
        this.playArea.strokeStyle = '#AAA38E';

        // Puts an outer border for style
        this.playArea.lineWidth = Constants.SIZE_OUTER_BORDER_BOARD;
        this.playArea.strokeRect(
            Constants.SIZE_OUTER_BORDER_BOARD / 2 + Constants.PADDING_BOARD_FOR_STANDS,
            Constants.SIZE_OUTER_BORDER_BOARD / 2 + Constants.PADDING_BOARD_FOR_STANDS,
            Constants.DEFAULT_WIDTH_BOARD - Constants.SIZE_OUTER_BORDER_BOARD,
            Constants.DEFAULT_HEIGHT_BOARD - Constants.SIZE_OUTER_BORDER_BOARD,
        );

        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        const fontSizeBonusWord = 'bold 11px system-ui';
        const shouldDrawStar = true;
        this.playArea.font = fontSizeBonusWord;
        // Handles the color of each square
        for (let x = 0; x < Constants.NUMBER_SQUARE_H_AND_W; x++) {
            for (let y = 0; y < Constants.NUMBER_SQUARE_H_AND_W; y++) {
                const tileData = mapTileColours.get(bonusBoard[x][y]);
                if (tileData) {
                    this.playArea.fillStyle = tileData;
                }
                this.drawTileAtPos(x, bonusBoard, y);
            }
        }

        // Draws the  star
        if (shouldDrawStar) {
            this.drawStar(Constants.DEFAULT_HEIGHT_BOARD / 2 + paddingForStands);
        }

        // Set parameters to draw the lines of the grid
        this.playArea.strokeStyle = '#AAA38E';
        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        // So we don't have magic values
        const jumpOfATile = 30;
        const asciiCodeStartLetters = 64;
        const fontSizeLettersOnSide = 25;
        const borderTopAndLeftBig = 14;
        const borderTopAndLeftLittle = 5;
        // The variable widthEachSquare being not a round number there is a rest that we need to use
        // in the next function
        const roundedRest = 1;
        for (
            let i = Constants.SIZE_OUTER_BORDER_BOARD + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + paddingForStands, j = 1;
            i < Constants.WIDTH_BOARD_NOBORDER + roundedRest + paddingForStands;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            // Put all the horizontal lines of the board
            this.playArea.moveTo(paddingForStands, i);
            this.playArea.lineTo(Constants.DEFAULT_WIDTH_BOARD + paddingForStands, i);

            // Put all the vectical lines of the board
            this.playArea.moveTo(i, paddingForStands);
            this.playArea.lineTo(i, Constants.DEFAULT_WIDTH_BOARD + paddingForStands);

            // Put all the letters/numbers on the board
            this.playArea.fillStyle = '#54534A';
            this.playArea.font = fontSizeLettersOnSide.toString() + 'px bold system-ui';

            if (j.toString().length === 1) {
                this.playArea.fillText(
                    j.toString(),
                    i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftBig,
                    jumpOfATile + paddingForStands,
                );
            } else {
                this.playArea.fillText(
                    j.toString(),
                    i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + borderTopAndLeftLittle,
                    jumpOfATile + paddingForStands,
                );
            }
            this.playArea.fillText(
                String.fromCharCode(asciiCodeStartLetters + j),
                borderTopAndLeftBig + paddingForStands,
                i - Constants.WIDTH_EACH_SQUARE - Constants.WIDTH_LINE_BLOCKS / 2 + jumpOfATile,
            );

            // Since our for loop stops at the index 14 we have to implement it manually
            // for the 15th number
            if (j === Constants.NUMBER_SQUARE_H_AND_W - 1) {
                j++;
                this.playArea.fillText(j.toString(), i + borderTopAndLeftLittle, jumpOfATile + paddingForStands);
                this.playArea.fillText(String.fromCharCode(asciiCodeStartLetters + j), borderTopAndLeftBig + paddingForStands, i + jumpOfATile);
            }
        }
        this.playArea.font = savedFont;

        this.playArea.stroke();
    }

    reDrawBoard(bonusBoard: string[][], board: Tile[][], letterBank: Map<string, LetterData>) {
        this.drawBoardInit(bonusBoard);
        for (let x = 0; x < Constants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < Constants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.playArea, letterBank);
                }
            }
        }
        //if this is our turn we redraw the arrow too
        if(this.infoClientService.isTurnOurs && this.isArrowPlaced){
            if(this.isArrowVertical){
                this.drawVerticalArrowDirection(this.arrowPosX, this.arrowPosY);
            }else{
                this.drawHorizontalArrowDirection(this.arrowPosX, this.arrowPosY);
            }
        }
    }

    reDrawOnlyTilesBoard(board: Tile[][], letterBank: Map<string, LetterData>) {
        for (let x = 0; x < Constants.NUMBER_SQUARE_H_AND_W + 2; x++) {
            for (let y = 0; y < Constants.NUMBER_SQUARE_H_AND_W + 2; y++) {
                if (board[x][y] !== undefined && board[x][y].letter.value !== '') {
                    this.drawingService.drawOneLetter(board[x][y].letter.value, board[x][y], this.playArea, letterBank);
                }
            }
        }
    }

    drawHorizontalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.playArea.strokeStyle = '#54534A';
        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        this.playArea.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.playArea.moveTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile);
        this.playArea.stroke();
        this.arrowPosX = verticalPosTile;
        this.arrowPosY = horizontalPosTile;
        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS;
    }

    drawVerticalArrowDirection(verticalPosTile: number, horizontalPosTile: number) {
        this.playArea.strokeStyle = '#54534A';
        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        this.playArea.beginPath();
        const oneFifthOfTile = 5;
        const oneFifthOfTileInDecimal = 1.25;
        const startPosXPx = this.startingPosPxOfTile(verticalPosTile - 1);
        const startPosYPx = this.startingPosPxOfTile(horizontalPosTile - 1);
        this.playArea.moveTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile);
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / 2, startPosYPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTileInDecimal);
        this.playArea.stroke();
        this.playArea.lineTo(startPosXPx + Constants.WIDTH_EACH_SQUARE / oneFifthOfTile, startPosYPx + Constants.WIDTH_EACH_SQUARE / 2);
        this.playArea.stroke();
        this.arrowPosX = verticalPosTile;
        this.arrowPosY = horizontalPosTile;
        this.playArea.lineWidth = Constants.WIDTH_LINE_BLOCKS;
    }

    drawTileAtPos(xPos: number, bonusBoard: string[][], yPos: number, width?: number) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        if (xPos > Constants.NUMBER_SQUARE_H_AND_W || yPos > Constants.NUMBER_SQUARE_H_AND_W) {
            return;
        }
        const savedFont = this.playArea.font;
        const fontSizeBonusWord = 'bold 11px system-ui';

        const borderTopAndLeft = 10;
        const marginForRoundedNumberAndLook = 2;
        this.playArea.font = fontSizeBonusWord;
        const xPosPx =
            xPos * (Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS) +
            Constants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2 +
            paddingForStands;
        const yPosPx =
            yPos * (Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS) +
            Constants.SIZE_OUTER_BORDER_BOARD -
            marginForRoundedNumberAndLook / 2 +
            paddingForStands;

        if (width || width === 0) {
            yPos += 1;
        }
        this.getFillTileColor(xPos, yPos, bonusBoard);
        const isPosTheCenterTile: boolean =
            xPos === Math.floor(Constants.NUMBER_SQUARE_H_AND_W / 2) && yPos - 1 === Math.floor(Constants.NUMBER_SQUARE_H_AND_W / 2);
        if (isPosTheCenterTile && this.isArrowPlaced) {
            this.redrawStar(xPosPx, yPosPx, width);
            this.playArea.font = savedFont;
            return;
        }
        if (width || width === 0) {
            // width is there because we have to adjust the size of the square because they are bigger than what is visible
            this.playArea.fillRect(xPosPx + width, yPosPx + width, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);
        } else {
            this.playArea.fillRect(
                xPosPx,
                yPosPx,
                Constants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
                Constants.WIDTH_EACH_SQUARE + marginForRoundedNumberAndLook,
            );
        }
        if (bonusBoard[xPos][yPos] !== 'xx') {
            this.playArea.fillStyle = '#104D45';
            // We don't want to draw the letter on the center
            if (xPos === (Constants.NUMBER_SQUARE_H_AND_W - 1) / 2 && yPos === (Constants.NUMBER_SQUARE_H_AND_W - 1) / 2) {
                this.playArea.font = savedFont;
                return;
            }
            if (bonusBoard[xPos][yPos].includes('letter')) {
                this.playArea.fillText(
                    'LETTRE',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playArea.measureText('LETTRE').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            } else {
                this.playArea.fillText(
                    'MOT',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playArea.measureText('MOT').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + marginForRoundedNumberAndLook / 2,
                );
            }
            if (bonusBoard[xPos][yPos].includes('x2')) {
                this.playArea.fillText(
                    'x2',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playArea.measureText('x2').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            } else {
                this.playArea.fillText(
                    'x3',
                    xPosPx + (Constants.WIDTH_EACH_SQUARE - this.playArea.measureText('x3').width) / 2 + marginForRoundedNumberAndLook / 2,
                    yPosPx + Constants.WIDTH_EACH_SQUARE / 2 + borderTopAndLeft,
                );
            }
        }
        this.playArea.font = savedFont;
    }

    removeTile(tile: Tile) {
        // remove a tile from the board but only visually
        this.playArea.beginPath();
        this.playArea.fillStyle = '#BEB9A6';
        this.playArea.fillRect(tile.position.x1, tile.position.y1, tile.position.width + 1, tile.position.height + 1);
        this.playArea.stroke();
    }

    findTileToPlaceArrow(positionPx: Vec2, board: Tile[][], bonusBoard: string[][]) {
        if (this.lettersDrawn) {
            return;
        }

        const coordsIndexOnBoard = this.getIndexOnBoardLogicFromClick(positionPx);
        if (board[coordsIndexOnBoard.y][coordsIndexOnBoard.x].old) {
            // check if the tile has a letter
            return; // if it does then we dont draw an arrow
        }

        // check if there was an arrow before and check if there is no tile on top of it
        if ((this.arrowPosX <= Constants.NUMBER_SQUARE_H_AND_W, this.arrowPosY <= Constants.NUMBER_SQUARE_H_AND_W)) {
            if (this.arrowPosX >= 0 && !board[this.arrowPosY][this.arrowPosX].old) {
                //redraw empty tile if there was an arrow before
                this.drawTileAtPos(this.arrowPosX - 1, bonusBoard, this.arrowPosY - 1, 1);
            }
        }
        if (this.arrowPosX !== coordsIndexOnBoard.x || this.arrowPosY !== coordsIndexOnBoard.y) {
            // if the tile clicked is another tile then reset the arrow direction
            this.isArrowVertical = true;
        }
        this.isArrowPlaced = true;
        if (this.isArrowVertical) {
            this.drawHorizontalArrowDirection(coordsIndexOnBoard.x, coordsIndexOnBoard.y);
        } else {
            this.drawVerticalArrowDirection(coordsIndexOnBoard.x, coordsIndexOnBoard.y);
        }
        this.isArrowVertical = !this.isArrowVertical;
    }

    private getIndexOnBoardLogicFromClick(coords: Vec2) : Vec2 {
        //we get rid of the border and the padding for the stands
        let coordsCleaned: Vec2 = new Vec2();
        coordsCleaned.x = coords.x - Constants.PADDING_BOARD_FOR_STANDS - Constants.SIZE_OUTER_BORDER_BOARD;
        coordsCleaned.y = coords.y - Constants.PADDING_BOARD_FOR_STANDS - Constants.SIZE_OUTER_BORDER_BOARD;
        let coordsIndexOnBoard = new Vec2();
        coordsIndexOnBoard.x = Math.floor((1 / (Constants.WIDTH_BOARD_NOBORDER / coordsCleaned.x)) * Constants.NUMBER_SQUARE_H_AND_W) + 1;
        coordsIndexOnBoard.y = Math.floor((1 / (Constants.WIDTH_BOARD_NOBORDER / coordsCleaned.y)) * Constants.NUMBER_SQUARE_H_AND_W) + 1;
        return coordsIndexOnBoard;
    }

    private getFillTileColor(xPos: number, yPos: number, bonusBoard: string[][]) {
        const tileData = this.mapTileColours.get(bonusBoard[xPos][yPos]);
        if (tileData) {
            this.playArea.fillStyle = tileData;
        }
    }

    private startingPosPxOfTile(tilePos: number): number {
        const pxPos = 
            Constants.PADDING_BOARD_FOR_STANDS + 
            Constants.SIZE_OUTER_BORDER_BOARD + 
            tilePos * Constants.WIDTH_EACH_SQUARE + 
            tilePos * Constants.WIDTH_LINE_BLOCKS;
        return pxPos;
    }

    private redrawStar(xPosPx: number, yPosPx: number, width?: number) {
        if (width) {
            this.playArea.fillRect(xPosPx + width, yPosPx + width, Constants.WIDTH_EACH_SQUARE - width, Constants.WIDTH_EACH_SQUARE - width);
        } else {
            return;
        }
        const XYPxForStar = Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_HEIGHT_BOARD / 2;
        this.drawStar(XYPxForStar);
    }

    private drawStar(centerXY: number) {
        const nbSpike = 6;
        const shiftValueForCenteredStar = 5;
        const radius = Constants.WIDTH_EACH_SQUARE / 2 - shiftValueForCenteredStar;

        // star draw
        this.playArea.fillStyle = '#AAA38E';
        this.playArea.beginPath();
        this.playArea.moveTo(centerXY + radius, centerXY);

        let theta = 0;
        let x = 0;
        let y = 0;
        for (let i = 1; i <= nbSpike * 2; i++) {
            if (i % 2 === 0) {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerXY + radius * Math.cos(theta);
                y = centerXY + radius * Math.sin(theta);
            } else {
                theta = (i * (Math.PI * 2)) / (nbSpike * 2);
                x = centerXY + (radius / 2) * Math.cos(theta);
                y = centerXY + (radius / 2) * Math.sin(theta);
            }
            this.playArea.lineTo(x, y);
        }
        this.playArea.closePath();
        this.playArea.fill();
    }

    private removeEl(array: string[][], remIdx: number) {
        return array.map((arr) => {
            return arr.filter((el, idx) => {
                return idx !== remIdx;
            });
        });
    }
}
