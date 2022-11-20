import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-board-stand',
    templateUrl: './board-stand.component.html',
    styleUrls: ['./board-stand.component.scss'],
})
export class BoardStandComponent implements AfterViewInit {
    @ViewChild('canvasPlayArea', { static: false }) playAreaElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('tmpTileCanvas', { static: false }) tmpTileElement!: ElementRef<HTMLCanvasElement>;
    playAreaCanvas: CanvasRenderingContext2D;
    tmpTileCanvas: CanvasRenderingContext2D;
    playAreaConvasSize: Vec2 = { x: Constants.DEFAULT_WIDTH_PLAY_AREA, y: Constants.DEFAULT_WIDTH_PLAY_AREA };
    isMouseDown: boolean = false;
    savedCoordsClick: Vec2 = { x: 0, y: 0 };
    clickedTile: Tile | undefined;
    // used to keep track of the original position of the tile when taken from board
    clickedTileIndex: Vec2 = new Vec2();
    // buffer used to reduce the number of emit to the server
    bufferMouseEvent: number = 0;
    lastBoardIndexsHover: Vec2 = new Vec2();
    displayLetterChoiceModal: string;
    letterChoice: string = '';

    constructor(
        private drawingBoardService: DrawingBoardService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        private placeGraphicService: PlaceGraphicService,
        private socketService: SocketService,
        private infoClientService: InfoClientService,
    ) {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeKeydownHandler(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keydown.backspace', ['$event'])
    onBackspaceKeydownHandler(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keyup.arrowright', ['$event'])
    @HostListener('document:keyup.arrowleft', ['$event'])
    handleArrowEvent(event: KeyboardEvent) {
        this.mouseKeyboardEventHandler.handleArrowEvent(event);
    }

    @HostListener('document:mousewheel', ['$event'])
    handleScrollEvent(event: WheelEvent) {
        this.mouseKeyboardEventHandler.handleScrollEvent(event);
    }

    @HostListener('document:mousedown', ['$event'])
    onMouseDown(event: MouseEvent) {
        this.isMouseDown = true;
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        if (this.areCoordsOnStand(coordsClick)) {
            this.clickedTile = this.mouseKeyboardEventHandler.onMouseDownGetStandTile(event);
        } else if (this.areCoordsOnBoard(coordsClick)) {
            this.clickedTile = this.mouseKeyboardEventHandler.onMouseDownGetBoardTile(event);
            this.clickedTileIndex = this.drawingBoardService.getIndexOnBoardLogicFromClick(coordsClick);
        }
    }

    @HostListener('document:mouseup', ['$event'])
    onMouseUp(event: MouseEvent) {
        this.isMouseDown = false;
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        // we don't want to clear if the method is with arrows because the arrows will disppear
        if (this.placeGraphicService.drapDropEnabled()) {
            this.socketService.socket.emit('clearTmpTileCanvas');
        }
        if (this.areCoordsOnBoard(coordsClick) && this.infoClientService.isTurnOurs) {
            // if we have a tile selected we process it
            if (this.clickedTile && this.clickedTile?.letter.value !== '' && this.placeGraphicService.drapDropEnabled()) {
                if (this.placeGraphicService.tileClickedFromStand) {
                    // if the tile from the stand is a star we display the modal to ask for which letter to use
                    // we save the coords of the click and return
                    if (this.clickedTile.letter.value === '*') {
                        this.savedCoordsClick = coordsClick;
                        this.displayLetterChoiceModal = 'block';
                        return;
                    }
                    this.mouseKeyboardEventHandler.onStandToBoardDrop(coordsClick, this.clickedTile, this.letterChoice);
                } else {
                    this.mouseKeyboardEventHandler.onBoardToBoardDrop(coordsClick, this.clickedTile);
                }
            } else {
                // else we just consider it as a click on the board
                this.mouseKeyboardEventHandler.onBoardClick(event);
            }
        } else if (this.areCoordsOnStand(coordsClick)) {
            if (
                this.clickedTile &&
                this.clickedTile?.letter.value !== '' &&
                !this.placeGraphicService.tileClickedFromStand &&
                this.placeGraphicService.drapDropEnabled() &&
                this.infoClientService.isTurnOurs
            ) {
                this.mouseKeyboardEventHandler.onBoardToStandDrop(coordsClick, this.clickedTile, this.clickedTileIndex);
            } else {
                if (event.button === Constants.LEFT_CLICK) {
                    this.mouseKeyboardEventHandler.onLeftClickStand(event);
                } else if (event.button === Constants.RIGHT_CLICK) {
                    this.mouseKeyboardEventHandler.onRightClickStand(event);
                }
            }
        }

        // if the modal to choose the letter is open we don't reset the variables
        if (this.displayLetterChoiceModal !== 'block') {
            this.clickedTile = undefined;
            this.clickedTileIndex = new Vec2();
        }
    }

    ngAfterViewInit(): void {
        this.playAreaCanvas = this.playAreaElement.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.tmpTileCanvas = this.tmpTileElement.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.drawingBoardService.canvasInit(this.playAreaCanvas, this.tmpTileCanvas);
        // add event lisntener for mouse movement
        // bind the component with the function to get acess to the attributes and functions of this component
        document.getElementById('tmpTileCanvas')?.addEventListener('mousemove', this.handleMouseMove.bind(this), true);
    }

    continueProcessingDrop() {
        if (!this.infoClientService.isTurnOurs) {
            this.clickedTile = undefined;
            this.clickedTileIndex = new Vec2();

            alert("Ce n'est plus votre tour de jouer !");
            return;
        }
        if (!this.allLetter(this.letterChoice)) {
            alert('Votre choix doit être une lettre ! Veuillez réessayer.');
            return;
        }
        if (!this.clickedTile || this.letterChoice === '') {
            return;
        }

        this.mouseKeyboardEventHandler.onStandToBoardDrop(this.savedCoordsClick, this.clickedTile, this.letterChoice);
        this.displayLetterChoiceModal = 'none';
        this.letterChoice = '';
    }

    private allLetter(txt: string): boolean {
        const letters = /^[A-Za-z]+$/;
        if (txt.match(letters)) {
            return true;
        } else {
            return false;
        }
    }

    private handleMouseMove(event: MouseEvent) {
        if (!this.isMouseDown || !this.clickedTile || this.clickedTile?.letter.value === '' || !this.infoClientService.isTurnOurs) {
            return;
        }
        // if we have some letter placed on the board and this is by keyboard not drag and drop
        // we leave bc the two methods of placement are not compatible (they are but the exigences doesn't want it)
        if (!this.placeGraphicService.drapDropEnabled()) {
            return;
        }

        const mouseCoords: Vec2 = { x: event.offsetX, y: event.offsetY };
        this.socketService.socket.emit('tileDraggedOnCanvas', this.clickedTile, mouseCoords);
    }

    private areCoordsOnBoard(coords: Vec2): boolean {
        const posXYStartForBoard = Constants.PADDING_BOARD_FOR_STANDS + Constants.SIZE_OUTER_BORDER_BOARD;
        const posXYEndForBoard = posXYStartForBoard + Constants.DEFAULT_WIDTH_BOARD - 2 * Constants.SIZE_OUTER_BORDER_BOARD;
        if (coords.x > posXYStartForBoard && coords.x < posXYEndForBoard && coords.y > posXYStartForBoard && coords.y < posXYEndForBoard) {
            return true;
        } else {
            return false;
        }
    }

    private areCoordsOnStand(coords: Vec2): boolean {
        const paddingForStands = Constants.DEFAULT_HEIGHT_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        const posXForStands =
            paddingForStands + Constants.SIZE_OUTER_BORDER_STAND + Constants.DEFAULT_WIDTH_BOARD / 2 - Constants.DEFAULT_WIDTH_STAND / 2;
        const posYForStands =
            Constants.DEFAULT_WIDTH_BOARD + paddingForStands + Constants.SIZE_OUTER_BORDER_STAND + Constants.PADDING_BET_BOARD_AND_STAND;
        if (
            coords.x > posXForStands &&
            coords.x < posXForStands + Constants.DEFAULT_WIDTH_STAND - Constants.SIZE_OUTER_BORDER_STAND * 2 &&
            coords.y > posYForStands &&
            coords.y < posYForStands + Constants.DEFAULT_HEIGHT_STAND - Constants.SIZE_OUTER_BORDER_STAND * 2
        ) {
            return true;
        } else {
            return false;
        }
    }
}
