import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Letter } from '@app/classes/letter';
import { Tile } from '@app/classes/tile';
import { Vec4 } from '@app/classes/vec4';
import { Service } from 'typedi';

@Service()
export class BoardService {
    initBoardArray(game: GameServer) {
        for (
            let i = 0,
                l =
                    Constants.SIZE_OUTER_BORDER_BOARD -
                    Constants.WIDTH_EACH_SQUARE -
                    Constants.WIDTH_LINE_BLOCKS +
                    Constants.PADDING_BOARD_FOR_STANDS;
            i < Constants.NUMBER_SQUARE_H_AND_W + 2;
            i++, l += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
        ) {
            game.board[i] = new Array<Tile>();
            for (
                let j = 0,
                    k =
                        Constants.SIZE_OUTER_BORDER_BOARD -
                        Constants.WIDTH_EACH_SQUARE -
                        Constants.WIDTH_LINE_BLOCKS +
                        Constants.PADDING_BOARD_FOR_STANDS;
                j < Constants.NUMBER_SQUARE_H_AND_W + 2;
                j++, k += Constants.WIDTH_EACH_SQUARE + Constants.WIDTH_LINE_BLOCKS
            ) {
                const newTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();

                newPosition.x1 = k;
                newPosition.y1 = l;
                newPosition.width = Constants.WIDTH_EACH_SQUARE;
                newPosition.height = Constants.WIDTH_EACH_SQUARE;

                newLetter.weight = 0;
                newLetter.value = '';

                newTile.letter = newLetter;
                newTile.position = newPosition;
                newTile.bonus = game.bonusBoard[i][j];

                game.board[i].push(newTile);
            }
        }
    }

    deleteLetterInBoardMap(letterToRemove: string, game: GameServer) {
        if (!game.mapLetterOnBoard.has(letterToRemove)) {
            return;
        }

        if (game.mapLetterOnBoard.get(letterToRemove).value === 1) {
            game.mapLetterOnBoard.delete(letterToRemove);
        } else {
            game.mapLetterOnBoard.get(letterToRemove).value--;
        }
    }

    writeLetterInGameMap(letterToPut: string, game: GameServer) {
        if (letterToPut === '') {
            return;
        }
        if (!game.mapLetterOnBoard.has(letterToPut)) {
            game.mapLetterOnBoard.set(letterToPut, { value: 1 });
        } else {
            game.mapLetterOnBoard.get(letterToPut).value++;
        }
    }

    rmTempTiles(game: GameServer) {
        for (let i = 0; i < game.board.length; i++) {
            for (let j = 0; j < game.board[i].length; j++) {
                // if the border is "#ffaaff" is means it's a tmp tile
                if (game.board[i][j].borderColor !== '#ffaaff') {
                    continue;
                }
                const emptyTile = new Tile();
                const newPosition = new Vec4();
                const newLetter = new Letter();
                newPosition.x1 = game.board[i][j].position.x1;
                newPosition.y1 = game.board[i][j].position.y1;
                newPosition.height = game.board[i][j].position.height;
                newPosition.width = game.board[i][j].position.width;

                newLetter.weight = 0;
                newLetter.value = '';

                emptyTile.bonus = game.bonusBoard[i][j];
                emptyTile.letter = newLetter;
                emptyTile.position = newPosition;

                game.board[i][j] = emptyTile;
            }
        }
    }
}
