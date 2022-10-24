import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { RankedService } from '@app/services/ranked.service';
import { SocketService } from '@app/services/socket.service';
import { TimerService } from '@app/services/timer.service';

@Component({
    selector: 'app-ranked-matchmaking-page',
    templateUrl: './ranked-matchmaking-page.component.html',
    styleUrls: ['./ranked-matchmaking-page.component.scss'],
})
export class RankedMatchmakingPageComponent {
    matchAccepted: boolean;
    constructor(public timerService: TimerService, private socketService: SocketService, public infoClientService: InfoClientService, public rankedService:RankedService) {
        this.timerService.clearTimer();
        this.startTimer();
        this.checkAcceptMatchTimer();
    }
    startTimer() {
        this.timerService.startMatchmakingTimer();
    }
    
    acceptMatch() {
        this.matchAccepted = true;
        this.timerService.clearTimer();
    }
    refuseMatch() {
        this.matchAccepted = false;
        this.timerService.clearTimer();
        this.socketService.socket.emit('matchRefuse', {player: this.infoClientService.player});
    }
    checkAcceptMatchTimer() {
        const timerInterval = setInterval(() => {
            if (this.timerService.secondsValue <= 0) {
                clearInterval(timerInterval);
            }
        }, 1000);
    }
}