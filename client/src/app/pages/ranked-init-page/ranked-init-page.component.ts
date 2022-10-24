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
    constructor(public infoClientService: InfoClientService, public userService: UserService,
        private socketService: SocketService){

    }
    eloDisparity: number = 60;

    onEloDisparityChange(value: any) {
        this.eloDisparity = value.value;
    }
    onConfirm() {
        this.infoClientService.eloDisparity = this.eloDisparity;
        this.startMatchmaking();
        
    }
    startMatchmaking() {
        this.socketService.socket.emit('startMatchmaking', {eloDisparity: this.eloDisparity, user: this.userService.user});
    }
}