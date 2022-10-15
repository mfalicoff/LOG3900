import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { Tile } from '@app/classes/tile';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
// import { DrawingService } from '@app/services/drawing.service';
// import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
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
    clickedTile: Tile | undefined;
    //buffer used to reduce the number of emit to the server
    bufferMouseEvent:number = 0;
    lastBoardIndexsHover: Vec2 = new Vec2();
    constructor(
        // private drawingService: DrawingService,
        private drawingBoardService: DrawingBoardService, 
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        // private infoClientService: InfoClientService,
        private socketService: SocketService
        ) 
    {}

    @HostListener('document:keydown.escape', ['$event'])
    onEscapeKeydownHandler(event: KeyboardEvent) {
        console.log("escape");
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keydown.backspace', ['$event'])
    onBackspaceKeydownHandler(event: KeyboardEvent) {
        console.log("backspace");
        this.mouseKeyboardEventHandler.handleKeyboardEvent(event);
    }

    @HostListener('document:keypress', ['$event'])
    handleKeyboardEvent(event: KeyboardEvent) {
        console.log("enter");
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
        if(this.areCoordsOnStand(coordsClick)){
            this.clickedTile = this.mouseKeyboardEventHandler.onMouseDownGetStandTile(event);
        }
    }

    @HostListener('document:mouseup', ['$event']) 
    onMouseUp(event: MouseEvent) {
        this.isMouseDown = false;
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        this.drawingBoardService.clearCanvas(this.tmpTileCanvas);
        if(this.areCoordsOnBoard(coordsClick)){
            //if we have a tile selected we process it
            if(this.clickedTile){
                this.mouseKeyboardEventHandler.onBoardTileDrop(coordsClick, this.clickedTile);
            }else{ // else we just consider it as a click on the board
                this.mouseKeyboardEventHandler.onBoardClick(event);
            }
        }else if (this.areCoordsOnStand(coordsClick)) {
            if(event.button === Constants.LEFT_CLICK){
                this.mouseKeyboardEventHandler.onLeftClickStand(event);
            }else if(event.button === Constants.RIGHT_CLICK){
                this.mouseKeyboardEventHandler.onRightClickStand(event);
            }
        }
        this.clickedTile = undefined;
    }

    ngAfterViewInit(): void {
        this.playAreaCanvas = (this.playAreaElement.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        this.tmpTileCanvas = (this.tmpTileElement.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        this.drawingBoardService.canvasInit(this.playAreaCanvas, this.tmpTileCanvas);
        //add event lisntener for mouse movement
        //bind the component with the function to get acess to the attributes and functions of this component
        document.getElementById('tmpTileCanvas')?.addEventListener("mousemove", this.handleMouseMove.bind(this), true);
    }

    private handleMouseMove(event: MouseEvent){
        if(!this.isMouseDown || !this.clickedTile /*|| this.bufferMouseEvent < 10*/){
            return;
        }
        const mouseCoords: Vec2 = { x: event.offsetX, y: event.offsetY };
        this.socketService.socket.emit("tileDraggedOnCanvas", this.clickedTile, mouseCoords);
        this.drawingBoardService.drawTileDraggedOnCanvas(this.clickedTile, mouseCoords);
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
