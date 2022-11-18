import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class TimerService {
    displayTimer: string = '';
    matchmakingDisplayTimer = '';
    secondsValue: number = 0;
    matchmakingSecondsValue: number = 0;
    playingTime: number = 0.0;
    private timerInterval: NodeJS.Timeout;
    private timerMatchmaking: NodeJS.Timeout;
    private timerGame: NodeJS.Timeout;

    startTimer(minutesByTurn: number) {
        if (minutesByTurn < 0) {
            return;
        }

        const secondsInMinute = 60;
        this.secondsValue = minutesByTurn * secondsInMinute;

        const displayZero = 9;
        const oneSecond = 1000;
        this.timerInterval = setInterval(() => {
            this.secondsValue--;
            if (this.secondsValue >= 0) {
                if (this.secondsValue % secondsInMinute <= displayZero) {
                    this.displayTimer = `Temps Restant : ${Math.floor(this.secondsValue / secondsInMinute)}:0${this.secondsValue % secondsInMinute}`;
                } else {
                    this.displayTimer = `Temps Restant : ${Math.floor(this.secondsValue / secondsInMinute)}:${this.secondsValue % secondsInMinute}`;
                }
            }
        }, oneSecond);
    }

    startMatchmakingTimer() {
        this.matchmakingSecondsValue = 0;
        const secondsInMinute = 60;
        const displayZero = 9;
        const oneSecond = 1000;
        // this.playingTime++;
        this.timerMatchmaking = setInterval(() => {
            this.matchmakingSecondsValue++;
            if (this.matchmakingSecondsValue % secondsInMinute <= displayZero) {
                this.matchmakingDisplayTimer = `Temps écoulé : ${Math.floor(this.matchmakingSecondsValue / secondsInMinute)}:0${
                    this.matchmakingSecondsValue % secondsInMinute
                }`;
            } else {
                this.matchmakingDisplayTimer = `Temps écoulé : ${Math.floor(this.matchmakingSecondsValue / secondsInMinute)}:${
                    this.matchmakingSecondsValue % secondsInMinute
                }`;
            }
        }, oneSecond);
    }

    startGameTimer() {
        this.playingTime = 0.0;
        const oneSecond = 1000;
        this.timerGame = setInterval(() => {
            this.playingTime++;
            console.log(this.playingTime);
        }, oneSecond);
    }

    clearTimer() {
        clearInterval(this.timerInterval);
    }
    clearMatchmakingTimer() {
        clearInterval(this.timerMatchmaking);
    }
    clearGameTimer() {
        clearInterval(this.timerGame);
        console.log(this.playingTime);
    }
    addSecsToTimer(secs: number) {
        this.secondsValue += secs;
    }
}
