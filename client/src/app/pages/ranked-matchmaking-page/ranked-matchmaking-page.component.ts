import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { RankedService } from '@app/services/ranked.service';
import { SocketService } from '@app/services/socket.service';
import { TimerService } from '@app/services/timer.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-ranked-matchmaking-page',
    templateUrl: './ranked-matchmaking-page.component.html',
    styleUrls: ['./ranked-matchmaking-page.component.scss'],
})
export class RankedMatchmakingPageComponent {
    matchAccepted: boolean;
    matchRefuseCss: boolean;
    constructor(
        public userService: UserService,
        public timerService: TimerService,
        private socketService: SocketService,
        public infoClientService: InfoClientService,
        public rankedService: RankedService,
    ) {
        this.timerService.clearTimer();
        this.timerService.clearMatchmakingTimer();
        this.timerService.startMatchmakingTimer();
    }

    acceptMatch() {
        this.matchAccepted = true;
        this.socketService.socket.emit('acceptMatch', { user: this.userService.user });
    }
    refuseMatch() {
        this.matchAccepted = false;
        this.matchRefuseCss = true;
        this.timerService.clearTimer();
        this.timerService.clearMatchmakingTimer();
        this.socketService.socket.emit('refuseMatch', { user: this.userService.user });
    }
}