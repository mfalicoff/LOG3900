import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import * as GlobalConstants from '@app/classes/global-constants';
import { Vec2 } from '@app/classes/vec2';
import { DrawingBoardService } from '@app/services/drawing-board-service';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements AfterViewInit {
    @ViewChild('gridBoard', { static: false }) gridBoard!: ElementRef<HTMLCanvasElement>;
    playAreaConvasSize: Vec2 = { x: GlobalConstants.DEFAULT_WIDTH_PLAY_AREA, y: GlobalConstants.DEFAULT_WIDTH_PLAY_AREA };
    boardCanvasSize: Vec2 = { x: GlobalConstants.DEFAULT_WIDTH_BOARD, y: GlobalConstants.DEFAULT_HEIGHT_BOARD };

    constructor(
        private drawingBoardService: DrawingBoardService, 
        private drawingService: DrawingService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        private infoClientService: InfoClientService) {}

    ngAfterViewInit(): void {
        this.drawingBoardService.canvasInit(this.gridBoard.nativeElement.getContext('2d') as CanvasRenderingContext2D);
        setTimeout(() => {
            this.drawingBoardService.drawBoardInit(
                this.infoClientService.game.bonusBoard);
            this.drawingService.initStand(true);
        }, GlobalConstants.WAIT_FOR_CANVAS_INI);

        console.log(GlobalConstants.DEFAULT_HEIGHT_STAND);
        console.log(this.infoClientService.game.bonusBoard)
    }

    onComponentBoardClick(event: MouseEvent) {
        this.mouseKeyboardEventHandler.onBoardClick(event);
    }
}
