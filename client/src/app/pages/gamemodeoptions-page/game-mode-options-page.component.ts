/* eslint-disable*/
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { UserService } from '@app/services/user.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-game-mode-options-page',
    templateUrl: './game-mode-options-page.component.html',
    styleUrls: ['./game-mode-options-page.component.scss'],
})
export class GameModeOptionsPageComponent {
    constructor(
        private infoClientService: InfoClientService, 
        private http: HttpClient, private router: Router, 
        public userService: UserService
    ) {}

    setGameMode(gameMode: string) {
        this.infoClientService.gameMode = gameMode;
    }

    async logOut() {
        return (
            this.http
                .post<any>(
                    environment.serverUrl + 'logout',
                    {},
                    {
                        headers: this.userService.getCookieHeader(),
                    },
                )
                // eslint-disable-next-line deprecation/deprecation
                .subscribe({
                    next: () => {
                        // @ts-ignore
                        localStorage.removeItem(`cookie-${this.userService.user._id}`);
                        localStorage.removeItem(`user-${this.userService.user._id}`);
                        this.infoClientService.playerName = '';
                        this.router.navigate(['/login']);
                    },
                    error: (error) => {
                        this.handleErrorPOST(error);
                    },
                })
        );
    }

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.message}`);
        }
    }
}