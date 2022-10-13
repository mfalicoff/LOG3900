import { Component, OnInit } from '@angular/core';
import { DrawingService } from '@app/services/drawing.service';
import { InfoClientService } from '@app/services/info-client.service';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

interface RandomAvatarResponse {
    data: string;
    message: string;
}

@Component({
    selector: 'app-info-panel',
    templateUrl: './info-panel.component.html',
    styleUrls: ['./info-panel.component.scss'],
})
export class InfoPanelComponent implements OnInit {
    enter: string = 'Enter';

    constructor(
        public drawingService: DrawingService,
        public socketService: SocketService,
        public placeGraphicService: PlaceGraphicService,
        public infoClientService: InfoClientService,
        public userService: UserService,
        private http: HttpClient,
    ) {}

    async ngOnInit() {
        this.infoClientService.actualRoom.players.map(async (player) => {
            try {
                this.http
                    .get<RandomAvatarResponse>(environment.serverUrl + 'avatar/random')
                    .subscribe((res) => (player.avatarForVirtPlayer = res.data));
            } catch (error) {
                alert('Erreur: ' + error.status + error.error.message);
            }
        });
    }

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
