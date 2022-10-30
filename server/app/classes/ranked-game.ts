import { RankedUser } from './ranked-user';

export class RankedGame {
    name:string;
    rankedUsers:RankedUser[];
    private timerInterval: NodeJS.Timeout;
    secondsValue: number = 0;

    constructor(name:string, rankedUsers: RankedUser[]) {
        this.rankedUsers = rankedUsers;
        this.name = name;
    }

    startTimer(time: number) {
        if (time <= 0) {
            return;
        }

        const secondsInMinute = 60;
        this.secondsValue = time * secondsInMinute;

        const oneSecond = 1000;
        this.timerInterval = setInterval(() => {
            this.secondsValue--;

        }, oneSecond);
    }
    clearTimer() {
        clearInterval(this.timerInterval);
    }
}