/* eslint-disable*/
import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import * as GlobalConstants from '@app/classes/global-constants';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-game-mode-options-page',
    templateUrl: './game-mode-options-page.component.html',
    styleUrls: ['./game-mode-options-page.component.scss'],
})
export class GameModeOptionsPageComponent {
    constructor(private infoClientService: InfoClientService, private http: HttpClient, private router: Router, public userService: UserService) {}

    onClickMulti(mode: string) {
        this.infoClientService.gameMode = GlobalConstants.MODE_MULTI;
        this.infoClientService.isLog2990Enabled = mode !== 'classic';
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
                        localStorage.removeItem(`cookie-${this.userService.user.id}`);
                        localStorage.removeItem(`user-${this.userService.user.id}`);
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
