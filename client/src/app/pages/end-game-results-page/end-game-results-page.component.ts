import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Player } from '@app/classes/player';
import { InfoClientService } from '@app/services/info-client.service';
import { TimerService } from '@app/services/timer.service';
import { ProfileReadOnlyPageComponent } from '@app/pages/profile-page/profile-read-only-page/profile-read-only-page.component';
import { environment } from '@app/../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { UserResponseInterface } from '@app/classes/response.interface';
import { Observable, Subscription } from 'rxjs';
import { GameSaved } from '@app/classes/game-saved';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-end-game-results-page',
    templateUrl: './end-game-results-page.component.html',
    styleUrls: ['./end-game-results-page.component.scss'],
})
export class EndGameResultsPageComponent implements OnInit, OnDestroy {
    roomName: string;
    numberOfTurns: number = 0;
    gameStartDate: string;
    playingTime: string;
    serverUrl = environment.serverUrl;
    players: Player[];
    gameSaved: GameSaved;
    gameSavedSubscription: Subscription;
    openProfileSubscription: Subscription;
    constructor(
        private matDialogRefEndGame: MatDialogRef<EndGameResultsPageComponent>,
        public infoClientService: InfoClientService,
        private userService: UserService,
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
        this.gameSavedSubscription = this.saveGame().subscribe(
            (res) => {
                // eslint-disable-next-line no-console
                this.gameSaved._id = res;
            },
            (error) => {
                if (error.error instanceof ErrorEvent) {
                    alert('Erreur: ' + error.status + error.error.message);
                } else {
                    alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
                }
            },
        );
    }

    ngOnDestroy() {
        this.gameSavedSubscription.unsubscribe();
        if (this.openProfileSubscription) this.openProfileSubscription.unsubscribe();
    }

    getUserByName(playerName: string): Observable<UserResponseInterface> {
        return this.httpClient.get<UserResponseInterface>(`${this.serverUrl}users/:name`, {
            observe: 'body',
            params: { name: playerName },
            responseType: 'json',
        });
    }

    openProfilePage(player: Player) {
        this.openProfileSubscription = this.getUserByName(player.name).subscribe({
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
        let time = '';
        if (this.timerService.playingTime % secondsInMinute <= displayZero) {
            time = `${Math.floor(this.timerService.playingTime / secondsInMinute)}:0${this.timerService.playingTime % secondsInMinute}`;
        } else {
            time = `0${Math.floor(this.timerService.playingTime / secondsInMinute)}:${this.timerService.playingTime % secondsInMinute}`;
        }
        this.playingTime = time;
        return this.playingTime;
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
            this.infoClientService.actualRoom.players,
            this.roomName,
            this.numberOfTurns,
            this.gameStartDate,
            this.playingTime,
            this.infoClientService.game.nbLetterReserve,
            this.infoClientService.actualRoom.spectators,
            this.infoClientService.game.winners,
        );
        return this.httpClient.post<string>(environment.serverUrl + 'games', { savedGame: this.gameSaved });
    }

    addGameToFavourites() {
        this.userService.updateFavourites(this.gameSaved._id as string).then((r) => {});
        // @ts-ignore
        console.log(this.userService.user?.favouriteGames[0]);
    }
}
