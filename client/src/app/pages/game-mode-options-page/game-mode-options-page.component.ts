/* eslint-disable*/
import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import * as GlobalConstants from '@app/classes/global-constants';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
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
        const headers = new HttpHeaders().set('Authorization', localStorage.getItem('cookie')?.split('=')[1].split(';')[0] as string);
        return (
            this.http
                .post<unknown>(
                    environment.serverUrl + 'logout',
                    {},
                    {
                        headers,
                    },
                )
                // eslint-disable-next-line deprecation/deprecation
                .subscribe({
                    next: () => {
                        // @ts-ignore
                        localStorage.clear();
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
