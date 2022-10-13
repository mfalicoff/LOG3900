import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import * as Constants from '@app/classes/global-constants';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';

@Component({
    selector: 'app-board-stand',
    templateUrl: './board-stand.component.html',
    styleUrls: ['./board-stand.component.scss'],
})
export class BoardStandComponent implements AfterViewInit {
    @ViewChild('canvasPlayArea', { static: false }) canvasPlayArea!: ElementRef<HTMLCanvasElement>;
    playAreaConvasSize: Vec2 = { x: Constants.DEFAULT_WIDTH_PLAY_AREA, y: Constants.DEFAULT_WIDTH_PLAY_AREA };

    constructor(private drawingBoardService: DrawingBoardService, private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService) {}

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

    ngAfterViewInit(): void {
        this.drawingBoardService.canvasInit(this.canvasPlayArea.nativeElement.getContext('2d') as CanvasRenderingContext2D);
    }

    onCanvasLeftClick(event: MouseEvent) {
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        if (this.areCoordsOnBoard(coordsClick)) {
            this.mouseKeyboardEventHandler.onBoardClick(event);
        } else if (this.areCoordsOnStand(coordsClick)) {
            this.mouseKeyboardEventHandler.onLeftClickStand(event);
        }
    }

    onCanvasRightClick(event: MouseEvent) {
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };
        if (this.areCoordsOnStand(coordsClick)) {
            this.mouseKeyboardEventHandler.onRightClickStand(event);
        }
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
