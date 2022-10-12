import { Component } from '@angular/core';
import { TimerService } from '@app/services/timer.service';
@Component({
    selector: 'app-ranked-matchmaking-page',
    templateUrl: './ranked-matchmaking-page.component.html',
    styleUrls: ['./ranked-matchmaking-page.component.scss'],
})
export class RankedMatchmakingPageComponent {
    constructor(public timerService: TimerService) {
        this.startTimer();
    }
    startTimer() {
        this.timerService.startMatchmakingTimer();
    }
}