import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Player } from '@app/classes/player';
import { InfoClientService } from '@app/services/info-client.service';
import { TimerService } from '@app/services/timer.service';

@Component({
    selector: 'app-end-game-results-page',
    templateUrl: './end-game-results-page.component.html',
    styleUrls: ['./end-game-results-page.component.scss'],
})
export class EndGameResultsPageComponent implements OnInit {
    nomSalle: string;
    numberOfTurns: number = 0;
    gameStartDate: string;
    playingTime: string;
    constructor(
        private matDialogRef: MatDialogRef<EndGameResultsPageComponent>,
        public infoClientService: InfoClientService,
        private timerService: TimerService,
    ) {}

    ngOnInit() {
        this.nomSalle = this.infoClientService.actualRoom.name;
    }

    lettersOnStand(player: Player): string {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand.toString();
    }
    closeModalEndGame() {
        this.matDialogRef.close();
    }

    findWinners(players: Player[]): void {
        let bestScore = 0;
        for (const player of players) {
            // subtract the score of the letters still on the stand
            // player.score -= this.countDeductedScore(player);
            // adds score final to database
            // storing the id of the player with the highest score
            if (player.score > bestScore) {
                // emptying the array
                this.infoClientService.game.winners = [];
                this.infoClientService.game.winners.push(player);
                bestScore = player.score;
            } else if (player.score === bestScore) {
                this.infoClientService.game.winners.push(player);
            }
        }
    }

    displayPlayingTime(): string {
        const secondsInMinute = 60;
        const displayZero = 9;
        if (this.timerService.playingTime % secondsInMinute <= displayZero) {
            this.playingTime = `${Math.floor(this.timerService.playingTime / secondsInMinute)}:0${this.timerService.playingTime % secondsInMinute}`;
        } else {
            this.playingTime = `0${Math.floor(this.timerService.playingTime / secondsInMinute)}:${this.timerService.playingTime % secondsInMinute}`;
        }
        return '\t' + this.playingTime;
    }

    findNumberOfTurns(): number {
        this.numberOfTurns =
            this.infoClientService.actualRoom.players[0].turn +
            this.infoClientService.actualRoom.players[1].turn +
            this.infoClientService.actualRoom.players[2].turn +
            this.infoClientService.actualRoom.players[3].turn;
        return this.numberOfTurns;
    }

    getGameStartDate(): string {
        this.gameStartDate = this.infoClientService.game.gameStart.toString();
        return this.gameStartDate;
    }

    findCreatorOfGame(): string | undefined {
        this.findWinners(this.infoClientService.actualRoom.players);
        // @ts-ignore
        return this.infoClientService.actualRoom.players.find((player: Player) => {
            if (player.isCreatorOfGame) return player.name;
        }).name;
    }
}
