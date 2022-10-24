import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Player } from '@app/classes/player';
import { InfoClientService } from '@app/services/info-client.service';
import { TimerService } from '@app/services/timer.service';
import { ProfileReadOnlyPageComponent } from '@app/pages/profile-page/profile-read-only-page/profile-read-only-page.component';
import { environment } from '@app/../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserResponseInterface } from '@app/classes/response.interface';
import { Observable } from 'rxjs';
import { GameSaved } from '@app/classes/game-saved';

@Component({
    selector: 'app-end-game-results-page',
    templateUrl: './end-game-results-page.component.html',
    styleUrls: ['./end-game-results-page.component.scss'],
})
export class EndGameResultsPageComponent implements OnInit {
    roomName: string;
    numberOfTurns: number = 0;
    gameStartDate: string;
    playingTime: string;
    serverUrl = environment.serverUrl;
    players: Player[];
    gameSaved: GameSaved;
    constructor(
        private matDialogRefEndGame: MatDialogRef<EndGameResultsPageComponent>,
        public infoClientService: InfoClientService,
        private timerService: TimerService,
        private dialog: MatDialog,
        private httpClient: HttpClient,
    ) {}

    ngOnInit() {
        this.roomName = this.infoClientService.actualRoom.name;
        this.players = this.infoClientService.actualRoom.players.copyWithin(0, 0, 3);
        this.findWinners(this.players);
        this.findNumberOfTurns();
        this.getGameStartDate();
    }

    getUserByName(playerName: string): Observable<UserResponseInterface> {
        return this.httpClient.get<UserResponseInterface>(`${this.serverUrl}users/:name`, {
            observe: 'body',
            params: { name: playerName },
            responseType: 'json',
        });
    }

    openProfilePage(player: Player) {
        this.getUserByName(player.name).subscribe({
            next: (res) => {
                this.dialog.open(ProfileReadOnlyPageComponent, {
                    data: {
                        message: 'userFound',
                        userInfo: res.data,
                    },
                    height: '40%',
                    width: '40%',
                });
            },
            error: (error: HttpErrorResponse) => {
                if (error.error instanceof ErrorEvent) {
                    alert('Erreur: ' + error.status + error.error.message);
                } else {
                    alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
                }
            },
        });
    }

    closeModalEndGame() {
        this.matDialogRefEndGame.close();
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

    findWinners(players: Player[]): void {
        let bestScore = 0;
        for (const player of players) {
            if (player.score > bestScore) {
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
        // @ts-ignore
        return this.infoClientService.actualRoom.players.find((player: Player) => {
            if (player.isCreatorOfGame) return player.name;
        }).name;
    }

    isLinkEnabled(player: Player): boolean {
        return player.idPlayer !== 'virtualPlayer';
    }

    saveGame() {
        this.gameSaved = new GameSaved(
            this.players,
            this.roomName,
            this.numberOfTurns,
            this.gameStartDate,
            this.playingTime,
            this.infoClientService.game.nbLetterReserve,
            this.infoClientService.actualRoom.spectators,
            this.infoClientService.game.winners,
        );

        return;
    }
}
