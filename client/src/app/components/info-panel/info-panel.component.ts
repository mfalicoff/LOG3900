import { Component } from '@angular/core';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent {
    enter: string = 'Enter';

    constructor(
        public drawingService: DrawingService,
        public socketService: SocketService,
        public placeGraphicService: PlaceGraphicService,
        public infoClientService: InfoClientService,
    ) {}

    onExchangeClick() {
        this.socketService.socket.emit('onExchangeClick');
    }
    onCancelClick() {
        this.socketService.socket.emit('onAnnulerClick');
    }

    skipTurnButton() {
        this.socketService.socket.emit('turnFinished');
    }
}
