import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-ranked-init-page',
    templateUrl: './ranked-init-page.component.html',
    styleUrls: ['./ranked-init-page.component.scss'],
})
export class RankedInitPageComponent {
    eloDisparity: number = 60;
    constructor(public infoClientService: InfoClientService, public userService: UserService, private socketService: SocketService) {}

    onEloDisparityChange(value: unknown) {
        this.eloDisparity = value.value;
    }
    onConfirm() {
        this.infoClientService.eloDisparity = this.eloDisparity;
        this.startMatchmaking();
    }
    startMatchmaking() {
        this.socketService.socket.emit('startMatchmaking', { eloDisparity: this.eloDisparity, user: this.userService.user });
    }
}
