/* eslint-disable*/
import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { UserService } from '@app/services/user.service';
import { TranslateService } from "@ngx-translate/core";
import { SocketService } from '@app/services/socket.service';
import { NotificationService } from '@app/services/notification.service';

@Component({
    selector: 'app-game-mode-options-page',
    templateUrl: './game-mode-options-page.component.html',
    styleUrls: ['./game-mode-options-page.component.scss'],
})
export class GameModeOptionsPageComponent {
    constructor(
        private infoClientService: InfoClientService,
        private http: HttpClient,
        private router: Router,
        private socketService: SocketService,
        public userService: UserService,
        private translate: TranslateService,
        private notifService: NotificationService
    ) {
        this.socketService.socket.emit("getAllChatRooms");
    }

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
            this.notifService.openSnackBar(this.translate.instant('ERROR') + error.status + error.error.message, false);
        } else {
            this.notifService.openSnackBar(this.translate.instant('ERROR') + error.status + this.translate.instant('MESSAGE_ERROR') + '\n' + error.message, false);
        }
    }

}
