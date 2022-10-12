import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { ChatService } from './chat.service';
import { LetterBankService } from './letter-bank.service';
import { PlayAreaService } from './play-area.service';
import { StandService } from './stand.service';

@Service()
export class MouseEventService {
    sio: io.Server;
    constructor(
        private standService: StandService, 
        private chatService: ChatService, 
        private playAreaService: PlayAreaService,
        private letterBankService: LetterBankService,
    ) {
        this.sio = new io.Server();
    }

    initSioMouseEvent(sio: io.Server) {
        this.sio = sio;
    }

    rightClickExchange(player: Player, positionX: number): void {
        const tilePos: number = this.tileClickedPosition(positionX);
        if (player.stand[tilePos].backgroundColor === '#ff6600') {
            return;
        }
        if (tilePos < Constants.NUMBER_SLOT_STAND) {
            if (player.stand[tilePos].backgroundColor === '#F7F7E3') {
                player.stand[tilePos].backgroundColor = '#AEB1D9';
            } else {
                this.resetTileStandAtPos(player, tilePos);
            }
        }
        this.sendStandToClient(player);
    }

    leftClickSelection(player: Player, positionX: number): void {
        const invalidIndex = -1;
        const tilePos: number = this.tileClickedPosition(positionX);
        if (player.stand[tilePos].backgroundColor === '#AEB1D9') {
            return;
        }
        if (player.tileIndexManipulation !== invalidIndex) {
            player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
        }
        player.tileIndexManipulation = tilePos;
        player.stand[tilePos].backgroundColor = '#ff6600';
        this.sendStandToClient(player);
    }

    keyboardSelection(player: Player, eventString: string) {
        if (!player.mapLetterOnStand.has(eventString)) {
            if (player.tileIndexManipulation !== Constants.DEFAULT_VALUE_NUMBER) {
                player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
            }
        } else {
            const oldTileIndex = player.tileIndexManipulation;
            let newIndex = this.standService.findIndexLetterInStand(eventString, oldTileIndex + 1, player);
            if (player.mapLetterOnStand.get(eventString).value > 1) {
                while (newIndex === oldTileIndex) {
                    newIndex = this.standService.findIndexLetterInStand(eventString, newIndex + 1, player);
                }
            }
            player.tileIndexManipulation = newIndex;
            this.drawChangeSelection(player, player.tileIndexManipulation, oldTileIndex);
        }
    }

    keyboardAndMouseManipulation(game: GameServer, player: Player, eventString: string) {
        if (player.tileIndexManipulation === Constants.DEFAULT_VALUE_NUMBER) {
            return;
        }
        let indexTileChanged = Constants.DEFAULT_VALUE_NUMBER;
        let conditionCheck;
        const maxIndexStand = 6;
        // keyup is the type of KeyboardEvent
        if (eventString[0] === 'A') {
            conditionCheck = () => {
                return eventString === 'ArrowLeft';
            };
        } else {
            conditionCheck = () => {
                return eventString[0] !== '-';
            };
        }
        if (conditionCheck()) {
            indexTileChanged = player.tileIndexManipulation - 1;
            if (player.tileIndexManipulation === 0) {
                indexTileChanged = maxIndexStand;
            }
        } else {
            indexTileChanged = player.tileIndexManipulation + 1;
            if (player.tileIndexManipulation === maxIndexStand) {
                indexTileChanged = 0;
            }
        }
        this.doTheManipulation(game, player, indexTileChanged);
    }

    exchangeButtonClicked(game: GameServer, player: Player): void {
        const exchangeCmd: string = this.createExchangeCmd(player);
        this.chatService.sendMessage(exchangeCmd, game, player);
        for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
            if (player.stand[i].backgroundColor === '#AEB1D9') {
                this.standService.updateStandAfterExchangeWithPos(i, player, game.letters, game.letterBank);
            }
        }

        this.resetExchangeTiles(player);
        this.sendStandToClient(player);
        this.playAreaService.changePlayer(game);
    }

    cancelButtonClicked(player: Player): void {
        this.resetAllTilesStand(player);
        this.sendStandToClient(player);
    }

    resetAllTilesStand(player: Player) {
        for (let i = 0; i < Constants.NUMBER_SLOT_STAND; i++) {
            this.resetTileStandAtPos(player, i);
        }
        this.sendStandToClient(player);
    }

    boardClick(player: Player, position: Vec2): void {
        this.resetAllTilesStand(player);
        //TODO remove that if all works
        // this.clickIsInBoard(player, position);
        // this.sendStandToClient(player);
    }

    addTempLetterBoard(game: GameServer, keyEntered: string, XIndex:number, YIndex: number){
        let tempTile = new Tile();
        tempTile.letter.value = keyEntered;
        tempTile.letter.weight = this.letterBankService.getLetterWeight(keyEntered, game.letterBank);
        tempTile.position.x1 = 
            Constants.PADDING_BOARD_FOR_STANDS 
          + Constants.SIZE_OUTER_BORDER_BOARD 
          + Constants.WIDTH_EACH_SQUARE * (XIndex - 1)
          + Constants.WIDTH_LINE_BLOCKS * (XIndex - 1);
        tempTile.position.y1 = 
            Constants.PADDING_BOARD_FOR_STANDS 
          + Constants.SIZE_OUTER_BORDER_BOARD 
          + Constants.WIDTH_EACH_SQUARE * (YIndex - 1)
          + Constants.WIDTH_LINE_BLOCKS * (YIndex - 1);
        tempTile.position.height = Constants.WIDTH_EACH_SQUARE;
        tempTile.position.width = Constants.WIDTH_EACH_SQUARE;
        tempTile.borderColor = "#ffaaff";

        game.board[YIndex][XIndex] = tempTile;
    }

    private drawChangeSelection(player: Player, newTileIndex: number, oldTileIndex: number) {
        if (newTileIndex !== Constants.DEFAULT_VALUE_NUMBER) {
            player.stand[newTileIndex].backgroundColor = '#ff6600';
        }
        if (oldTileIndex !== Constants.DEFAULT_VALUE_NUMBER && newTileIndex !== oldTileIndex) {
            player.stand[oldTileIndex].backgroundColor = '#F7F7E3';
        }
        this.sendStandToClient(player);
    }

    private tileClickedPosition(positionX: number): number {
        return Math.floor(Constants.DEFAULT_NB_LETTER_STAND / (Constants.DEFAULT_WIDTH_STAND / positionX));
    }

    private doTheManipulation(game: GameServer, player: Player, indexTileChanged: number) {
        this.handleLogicManipulation(game, player, indexTileChanged);
        this.handleViewManipulation(indexTileChanged, player);
        player.tileIndexManipulation = indexTileChanged;
        this.sendStandToClient(player);
    }

    private handleViewManipulation(indexTileChanged: number, player: Player) {
        player.stand[indexTileChanged].backgroundColor = '#ff6600';
        player.stand[player.tileIndexManipulation].backgroundColor = '#F7F7E3';
    }

    private handleLogicManipulation(game: GameServer, player: Player, indexTileChanged: number) {
        // we save the letter to the left
        const oldLetter = player.stand[indexTileChanged].letter.value;

        // we change the letter to the left for the one to the rigth
        this.standService.writeLetterArrayLogic(indexTileChanged, player.stand[player.tileIndexManipulation].letter.value, game.letterBank, player);

        // we write the letter to the right for the one to the left
        this.standService.writeLetterArrayLogic(player.tileIndexManipulation, oldLetter, game.letterBank, player);
    }

    private createExchangeCmd(player: Player): string {
        let exchangeCmd = '!échanger ';
        for (const tile of player.stand) {
            if (tile.backgroundColor === '#AEB1D9') {
                exchangeCmd = exchangeCmd + tile.letter.value;
            }
        }
        return exchangeCmd;
    }

    private resetExchangeTiles(player: Player) {
        for (let i = 0; i < player.stand.length; i++) {
            if (player.stand[i].backgroundColor === '#AEB1D9') {
                this.resetTileStandAtPos(player, i);
            }
        }
    }

    private resetTileStandAtPos(player: Player, position: number) {
        player.stand[position].backgroundColor = '#F7F7E3';
    }

    //TODO remove that if all works
    // private clickIsInBoard(player: Player, position: Vec2) {
    //     const realPosInBoardPx: Vec2 = {
    //         x: position.x - Constants.SIZE_OUTER_BORDER_BOARD,
    //         y: position.y - Constants.SIZE_OUTER_BORDER_BOARD,
    //     };
    //     const isClickPosXInBoard: boolean = realPosInBoardPx.x > 0 && realPosInBoardPx.x < Constants.WIDTH_BOARD_NOBORDER;
    //     const isClickPosYInBoard: boolean = realPosInBoardPx.y > 0 && realPosInBoardPx.y < Constants.WIDTH_BOARD_NOBORDER;
    //     if (isClickPosXInBoard && isClickPosYInBoard) {
    //         this.sio.sockets.sockets.get(player.idPlayer)?.emit('findTileToPlaceArrow', realPosInBoardPx);
    //     }
    // }

    private sendStandToClient(player: Player) {
        this.sio.sockets.sockets.get(player.idPlayer)?.emit('playerAndStandUpdate', player);
    }
}
