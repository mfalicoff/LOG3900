import { Injectable } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';

@Injectable({
    providedIn: 'root',
})
export class DrawingService {
    canvasBoardStand: CanvasRenderingContext2D;

    canvasInit(canvas: CanvasRenderingContext2D) {
        this.canvasBoardStand = canvas;
    }

    reDrawStand(stand: Tile[], letterBank: Map<string, LetterData>) {
        this.initStand(true);
        for (let x = 0; x < Constants.NUMBER_SLOT_STAND; x++) {
            if (stand[x] !== undefined && stand[x].letter.value !== '') {
                this.drawOneLetter(stand[x].letter.value, stand[x], this.canvasBoardStand, letterBank);
            }
        }
    }

    resetColorTileStand(player: Player, letterBank: Map<string, LetterData>) {
        for (let x = 0; x < Constants.NUMBER_SLOT_STAND; x++) {
            if (player.stand[x] !== undefined && player.stand[x].letter.value !== '') {
                this.drawOneLetter(player.stand[x].letter.value, player.stand[x], this.canvasBoardStand, letterBank);
            }
        }
    }

    drawOneLetter(letterToDraw: string, tile: Tile, canvas: CanvasRenderingContext2D, letterBank: Map<string, LetterData>) {
        const letterToDrawUpper = letterToDraw.toUpperCase();
        canvas.beginPath();
        canvas.fillStyle = tile.backgroundColor;
        canvas.strokeStyle = tile.backgroundColor;
        // draws background of tile
        canvas.fillRect(tile.position.x1 + 1, tile.position.y1 + 1, tile.position.width - 2, tile.position.height - 2);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.strokeStyle = '#54534A';
        canvas.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
        canvas.strokeStyle = tile.borderColor;
        // draws border of tile
        this.roundRect(tile.position.x1 + 1, tile.position.y1 + 1, tile.position.width - 2, tile.position.height - 2, canvas);
        // the number are so the letter tiles are smaller than the tile of the board
        canvas.fillStyle = '#212121';
        const letterData = letterBank.get(letterToDraw.toUpperCase());
        let letterWeight = 0;
        if (letterData) {
            letterWeight = letterData.weight;
        }
        const spaceForLetter: Vec2 = { x: 4, y: 25 };
        const spaceForNumber: Vec2 = { x: 23, y: 25 };
        const actualFont = canvas.font;
        canvas.font = '18px bold system-ui';
        canvas.fillText(letterToDrawUpper, tile.position.x1 + spaceForLetter.x, tile.position.y1 + spaceForLetter.y);

        canvas.font = '12px bold system-ui';
        if (letterWeight) {
            canvas.fillText(letterWeight.toString(), tile.position.x1 + spaceForNumber.x, tile.position.y1 + spaceForNumber.y);
        } else {
            canvas.fillText('', tile.position.x1 + spaceForNumber.x, tile.position.y1 + spaceForNumber.y);
        }
        canvas.font = actualFont;
        canvas.stroke();
    }

    removeTile(tile: Tile) {
        tile.isOnBoard = true;
        this.canvasBoardStand.beginPath();
        this.canvasBoardStand.fillStyle = '#BEB9A6';
        this.canvasBoardStand.fillRect(tile.position.x1, tile.position.y1, tile.position.width, tile.position.height);
        this.canvasBoardStand.stroke();
    }

    areLettersRightClicked(stand: Tile[]) {
        for (const tile of stand) {
            if (tile.backgroundColor === '#AEB1D9') {
                return true;
            }
        }
        return false;
    }

    initStand(isPlayerSpec: boolean) {
        const constPosXYForStands = Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
        if (isPlayerSpec) {
            // top stand
            this.drawHorizStand(constPosXYForStands, 0);
            // left stand
            this.drawVertiStand(0, constPosXYForStands);
            // right stand
            this.drawVertiStand(
                Constants.PADDING_BOARD_FOR_STANDS + Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BET_BOARD_AND_STAND,
                constPosXYForStands,
            );
        }
        // bottom stand
        this.drawHorizStand(
            constPosXYForStands,
            Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BOARD_FOR_STANDS + Constants.PADDING_BET_BOARD_AND_STAND,
        );
    }

    // function that draws all the stands in the game
    drawSpectatorStands(players: Player[]) {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        const constPosXYForStands = paddingForStands + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
        this.drawVertiStand(0, constPosXYForStands, players[0]);
        this.drawVertiStand(
            paddingForStands + Constants.DEFAULT_WIDTH_BOARD + Constants.PADDING_BET_BOARD_AND_STAND,
            constPosXYForStands,
            players[1],
        );
        this.drawHorizStand(constPosXYForStands, 0, players[2]);
        this.drawHorizStand(
            constPosXYForStands,
            Constants.DEFAULT_WIDTH_BOARD + paddingForStands + Constants.PADDING_BET_BOARD_AND_STAND,
            players[3],
        );
    }

    // Function to draw a rounded rectangle with a default radius of 8
    private roundRect(x1: number, y1: number, width: number, height: number, canvas: CanvasRenderingContext2D) {
        let radius = 8;
        if (width < 2 * radius) radius = width / 2;
        if (height < 2 * radius) radius = height / 2;
        canvas.beginPath();
        canvas.moveTo(x1 + radius, y1);
        canvas.arcTo(x1 + width, y1, x1 + width, y1 + height, radius);
        canvas.arcTo(x1 + width, y1 + height, x1, y1 + height, radius);
        canvas.arcTo(x1, y1 + height, x1, y1, radius);
        canvas.arcTo(x1, y1, x1 + width, y1, radius);
        canvas.closePath();
        return this;
    }

    // the x and y are coords of the point in the top left corner of the stand
    private drawHorizStand(x: number, y: number, player?: Player) {
        this.canvasBoardStand.font = '19px bold system-ui';
        this.canvasBoardStand.beginPath();
        // Fill the rectangle with an initial color
        this.canvasBoardStand.fillStyle = '#BEB9A6';
        this.canvasBoardStand.fillRect(x, y, Constants.DEFAULT_WIDTH_STAND, Constants.DEFAULT_HEIGHT_STAND);

        // Puts an outer border for style
        this.canvasBoardStand.strokeStyle = '#AAA38E';
        this.canvasBoardStand.lineWidth = Constants.SIZE_OUTER_BORDER_STAND;
        this.canvasBoardStand.strokeRect(
            Constants.SIZE_OUTER_BORDER_STAND / 2 + x,
            Constants.SIZE_OUTER_BORDER_STAND / 2 + y,
            Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND,
            Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND,
        );
        // Puts all the lines
        this.canvasBoardStand.lineWidth = Constants.WIDTH_LINE_BLOCKS;

        for (
            let i = Constants.SIZE_OUTER_BORDER_STAND + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + x;
            i < Constants.DEFAULT_WIDTH_STAND + x;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            // Put all the vertical lines of the board
            this.canvasBoardStand.moveTo(i, Constants.SIZE_OUTER_BORDER_STAND + y);
            this.canvasBoardStand.lineTo(i, Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND + y);
        }
        this.canvasBoardStand.stroke();

        if (!player) {
            return;
        }
        // If a player has been given, draw the player's stand
        for (
            let i = x + Constants.SIZE_OUTER_BORDER_STAND, j = 0;
            i < Constants.DEFAULT_WIDTH_STAND + x - Constants.SIZE_OUTER_BORDER_STAND && j < player.stand.length;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            if (!player.stand[j].letter || player.stand[j].letter.value === '') {
                continue;
            }

            // draws the background of the tile
            this.canvasBoardStand.fillStyle = '#F7F7E3';
            this.canvasBoardStand.fillRect(i, Constants.SIZE_OUTER_BORDER_STAND + y, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);

            // draws the border of the tile
            this.canvasBoardStand.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
            this.canvasBoardStand.strokeStyle = '#54534A';
            this.roundRect(i, y + Constants.SIZE_OUTER_BORDER_STAND, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE, this.canvasBoardStand);

            const spaceForLetter: Vec2 = { x: 4, y: 25 };
            const spaceForNumber: Vec2 = { x: 23, y: 25 };
            // draws the letter on the tile
            this.canvasBoardStand.fillStyle = '#212121';
            this.canvasBoardStand.font = '18px bold system-ui';
            this.canvasBoardStand.fillText(
                player.stand[j].letter.value.toUpperCase(),
                i + spaceForLetter.x,
                y + Constants.SIZE_OUTER_BORDER_STAND + spaceForLetter.y,
            );
            // draws the weight of the letter on the tile
            this.canvasBoardStand.font = '12px bold system-ui';
            const letterWeight = player.stand[j].letter.weight;
            if (letterWeight) {
                this.canvasBoardStand.fillText(
                    letterWeight.toString(),
                    i + spaceForNumber.x,
                    y + Constants.SIZE_OUTER_BORDER_STAND + spaceForNumber.y,
                );
            }
            this.canvasBoardStand.stroke();
        }
    }

    // the x and y are coords of the point in the top left corner of the stand
    private drawVertiStand(x: number, y: number, player?: Player) {
        this.canvasBoardStand.font = '19px bold system-ui';
        this.canvasBoardStand.beginPath();
        // Fill the rectangle with an initial color
        this.canvasBoardStand.fillStyle = '#BEB9A6';
        this.canvasBoardStand.fillRect(x, y, Constants.DEFAULT_HEIGHT_STAND, Constants.DEFAULT_WIDTH_STAND);

        // Puts an outer border for style
        this.canvasBoardStand.strokeStyle = '#AAA38E';
        this.canvasBoardStand.lineWidth = Constants.SIZE_OUTER_BORDER_STAND;
        this.canvasBoardStand.strokeRect(
            Constants.SIZE_OUTER_BORDER_STAND / 2 + x,
            Constants.SIZE_OUTER_BORDER_STAND / 2 + y,
            Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND,
            Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND,
        );
        // Puts all the lines
        this.canvasBoardStand.lineWidth = Constants.WIDTH_LINE_BLOCKS;
        for (
            let i = Constants.SIZE_OUTER_BORDER_STAND + Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS / 2 + y;
            i < Constants.DEFAULT_WIDTH_STAND + y;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            // Put all the vertical lines of the board
            this.canvasBoardStand.moveTo(Constants.SIZE_OUTER_BORDER_STAND + x, i);
            this.canvasBoardStand.lineTo(Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND + x, i);
        }
        this.canvasBoardStand.stroke();

        if (!player) {
            return;
        }
        // If a player has been given, draw the player's stand
        for (
            let i = y + Constants.SIZE_OUTER_BORDER_STAND, j = 0;
            i < Constants.DEFAULT_WIDTH_STAND + y - Constants.SIZE_OUTER_BORDER_STAND && j < player.stand.length;
            i += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS, j++
        ) {
            if (!player.stand[j].letter || player.stand[j].letter.value === '') {
                continue;
            }

            // draws the background of the tile
            this.canvasBoardStand.fillStyle = '#F7F7E3';
            this.canvasBoardStand.fillRect(x + Constants.SIZE_OUTER_BORDER_STAND, i, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE);

            // draws the border of the tile
            this.canvasBoardStand.lineWidth = Constants.WIDTH_LINE_BLOCKS / 2;
            this.canvasBoardStand.strokeStyle = '#54534A';
            this.roundRect(x + Constants.SIZE_OUTER_BORDER_STAND, i, Constants.WIDTH_EACH_SQUARE, Constants.WIDTH_EACH_SQUARE, this.canvasBoardStand);

            const spaceForLetter: Vec2 = { x: 4, y: 25 };
            const spaceForNumber: Vec2 = { x: 23, y: 25 };
            // draws the letter on the tile
            this.canvasBoardStand.fillStyle = '#212121';
            this.canvasBoardStand.font = '18px bold system-ui';
            this.canvasBoardStand.fillText(
                player.stand[j].letter.value.toUpperCase(),
                x + Constants.SIZE_OUTER_BORDER_STAND + spaceForLetter.x,
                i + spaceForLetter.y,
            );
            // draws the weight of the letter on the tile
            this.canvasBoardStand.font = '12px bold system-ui';
            const letterWeight = player.stand[j].letter.weight;
            if (letterWeight) {
                this.canvasBoardStand.fillText(
                    letterWeight.toString(),
                    x + Constants.SIZE_OUTER_BORDER_STAND + spaceForNumber.x,
                    i + spaceForNumber.y,
                );
            }
            this.canvasBoardStand.stroke();
        }
    }
}
