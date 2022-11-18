import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { environment } from '@app/../environments/environment';
import { GameSaved } from '@app/classes/game-saved';
import { Player } from '@app/classes/player';
import { UserResponseInterface } from '@app/classes/response.interface';
import { ProfileReadOnlyPageComponent } from '@app/pages/profile-page/profile-read-only-page/profile-read-only-page.component';
import { EloChangeService } from '@app/services/elo-change.service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { TimerService } from '@app/services/timer.service';
import { UserService } from '@app/services/user.service';
import { Observable, Subscription } from 'rxjs';

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
    openProfileSubscription: Subscription;
    newPlayersElo: Player[];

    constructor(
        private matDialogRefEndGame: MatDialogRef<EndGameResultsPageComponent>,
        public infoClientService: InfoClientService,
        private userService: UserService,
        private dialog: MatDialog,
        private httpClient: HttpClient,
        private eloChangeService: EloChangeService,
        private socketService: SocketService,
        private timerService: TimerService,
    ) {}

    ngOnInit() {
        this.roomName = this.infoClientService.actualRoom.name;
        this.players = this.infoClientService.actualRoom.players.copyWithin(0, 0, 3);
        this.orderPlayerByScore();
        this.findWinners(this.players);
        this.findNumberOfTurns();
        this.getGameStartDate();
        this.displayPlayingTime();
        this.orderPlayerByScore();
        this.saveGame();
        this.newPlayersElo = this.eloChangeService.changeEloOfPlayers(this.players);
        this.changeEloOfPlayersDB();
    }

    ngOnDestroy() {
        if (this.openProfileSubscription) this.openProfileSubscription.unsubscribe();
    }

    orderPlayerByScore() {
        this.players = this.players.sort((element1, element2) => element2.score - element1.score);
    }

    getUserByName(playerName: string): Observable<UserResponseInterface> {
        return this.httpClient.get<UserResponseInterface>(`${this.serverUrl}users/${playerName}`, {
            observe: 'body',
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
                    height: '60%',
                    width: '45%',
                    panelClass: 'customDialog',
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

    changeEloOfPlayersDB() {
        for (const player of this.newPlayersElo) {
            this.socketService.socket.emit('changeElo', player);
        }
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

    displayPlayingTime(): void {
        const secondsInMinute = 60;
        const displayZero = 9;
        const minutesToDisplay = this.timerService.playingTime / secondsInMinute;
        const secondsToDisplay = this.timerService.playingTime % secondsInMinute;
        if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
            this.playingTime = `0${Math.floor(minutesToDisplay)}:0${secondsToDisplay}`;
        } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
            this.playingTime = `${Math.floor(minutesToDisplay)}:0${secondsToDisplay}`;
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
            this.playingTime = `0${Math.floor(minutesToDisplay)}:${secondsToDisplay}`;
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
            this.playingTime = `${Math.floor(minutesToDisplay)}:${secondsToDisplay}`;
        }
    }

    findNumberOfTurns(): void {
        this.numberOfTurns =
            this.infoClientService.actualRoom.players[0].turn +
            this.infoClientService.actualRoom.players[1].turn +
            this.infoClientService.actualRoom.players[2].turn +
            this.infoClientService.actualRoom.players[3].turn;
    }

    getGameStartDate(): void {
        this.gameStartDate = this.infoClientService.game.gameStart.toString();
    }

    findCreatorOfGame(): string | undefined {
        // @ts-ignore
        return this.infoClientService.actualRoom.players.find((player: Player) => {
            if (player.isCreatorOfGame) return player.name;
        }).name;
    }

    isLinkEnabled(player: Player): boolean {
        return player.id !== 'virtualPlayer';
    }

    saveGame(): void {
        if (this.socketService.socket.id === this.infoClientService.game.masterTimer) {
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
            this.socketService.socket.emit('saveGame', this.gameSaved);
        }
    }

    async addGameToFavourites() {
        await this.userService.updateFavourites(this.socketService.gameId);
    }
}
