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
    matchFound:boolean;
    constructor(public timerService: TimerService, private socketService: SocketService, public infoClientService: InfoClientService, public rankedService:RankedService) {
        this.timerService.clearTimer();
        this.startTimer();
        this.startMatchmaking();
    }
    startTimer() {
        this.timerService.startMatchmakingTimer();
    }
    startMatchmaking() {
        console.log(this.infoClientService.player);
        this.socketService.socket.emit('startMatchmaking', {player: this.infoClientService.player});
    }
    
    acceptMatch() {
        this.matchAccepted = true;
        this.timerService.clearTimer();
    }
    refuseMatch() {
        this.matchAccepted = false;
        this.timerService.clearTimer();
    }
}