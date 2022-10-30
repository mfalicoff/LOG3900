import { Injectable } from '@angular/core';
import { TimerService } from '@app/services/timer.service';

@Injectable({
    providedIn: 'root',
})
export class RankedService {
    isShowModal:boolean;
    constructor(public timerService: TimerService) {
        this.isShowModal = false;
    }

    matchHasBeenFound() {
        this.isShowModal= true;
        this.timerService.startTimer(0.25);
    }
    closeModal() {
        this.timerService.clearTimer();
        this.isShowModal = false;
    }
    
}