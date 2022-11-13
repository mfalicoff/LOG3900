import { Injectable } from '@angular/core';
import { TimerService } from '@app/services/timer.service';

@Injectable({
    providedIn: 'root',
})
export class RankedService {
    matchAccepted: boolean;
    isShowModal: boolean;
    constructor(public timerService: TimerService) {
        this.isShowModal = false;
    }

    matchHasBeenFound() {
        const timerTime = 0.25;
        this.isShowModal = true;
        this.timerService.startTimer(timerTime);
    }
    closeModal() {
        this.timerService.clearTimer();
        this.isShowModal = false;
        this.matchAccepted = false;
    }
}
