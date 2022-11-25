/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@app/classes/user.interface';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserResponseInterface } from '@app/classes/response.interface';
import { GameSaved } from '@app/classes/game-saved';
import { InfoClientService } from '@app/services/info-client.service';
import { Router } from '@angular/router';
import { Socket } from 'socket.io-client';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from './notification.service';
import { ConfirmWindowComponent } from '@app/components/confirm-window/confirm-window.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: User;
    serverUrl = environment.serverUrl;

    constructor(
        private http: HttpClient,
        private infoClientService: InfoClientService,
        private router: Router,
        private notifService: NotificationService,
        private dialog: MatDialog,
        private translate: TranslateService,
    ) {}

    getUser(user: User): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${environment.serverUrl}users/${user._id}`);
    }

    updateUserInstance(user: User) {
        localStorage.removeItem(`user-${user._id}`);
        localStorage.setItem(`user-${user._id}`, JSON.stringify(user));
        this.user = user;
    }

    getCookieHeader(): HttpHeaders {
        return new HttpHeaders().set('Authorization', localStorage.getItem(`cookie-${this.user._id}`)?.split('=')[1].split(';')[0] as string);
    }

    async signUp(name: string, email: string, password: string, avatarPath: string, socket: Socket) {
        this.http
            .post<unknown>(this.serverUrl + 'signup', {
                name,
                email,
                password,
                avatarPath,
            })
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: () => {
                    this.http
                        .post<unknown>(this.serverUrl + 'login', {
                            email,
                            password,
                        })
                        // eslint-disable-next-line deprecation/deprecation
                        .subscribe({
                            next: (response) => {
                                this.saveUserInfo(response, socket);
                            },
                            error: (error) => {
                                this.handleErrorPOST(error);
                            },
                        });
                },
                error: (error) => {
                    this.handleErrorPOST(error, socket);
                },
            });
    }

    async signIn(email: string, password: string, socket: Socket) {
        this.http
            .post<any>(this.serverUrl + 'login', {
                email,
                password,
            })
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: (response) => {
                    this.saveUserInfo(response, socket);
                    socket.emit('getAllAvatars');
                },
                error: (error) => {
                    this.handleErrorPOST(error, socket, email, password);
                },
            });
    }

    async logout() {
        this.http
            .post<unknown>(
                environment.serverUrl + 'logout',
                {},
                {
                    headers: this.getCookieHeader(),
                },
            )
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: () => {
                    // @ts-ignore
                    localStorage.removeItem(`cookie-${this.user._id}`);
                    localStorage.removeItem(`user-${this.user._id}`);
                    this.infoClientService.playerName = 'DefaultPlayerName';
                    this.router.navigate(['/home']);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateUsername(newName: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                {
                    name: newName,
                },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateAvatar(newAvatarIndex: number, socket: Socket) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                {
                    avatarPath: `avatar${newAvatarIndex + 1}`,
                },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                    this.infoClientService.userAvatars.set(this.user.name, this.user.avatarUri as string);
                    socket.emit('updatedAvatar', this.user.name);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async updateFavourites(idOfGame: string) {
        return this.http
            .patch<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user._id,
                { gameId: idOfGame },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    this.updateUserInstance(res.data);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    getFavouriteGames() {
        return this.http.get<GameSaved[]>(environment.serverUrl + 'users/games/' + this.user._id, { observe: 'body' });
    }

    getUserByName(playerName: string): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${this.serverUrl}users/${playerName}`, {
            observe: 'body',
            responseType: 'json',
        });
    }

    async updateLanguage(languageUpdated: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/language/' + this.user._id,
                { language: languageUpdated },
                {
                    headers: this.getCookieHeader(),
                },
            )
            .subscribe({
                next: (res) => {
                    // eslint-disable-next-line no-console
                    console.log(res);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    private handleErrorPOST(error: HttpErrorResponse, socket?: Socket, email?: string, password?: string) {
        if (error.error instanceof ErrorEvent) {
            this.notifService.openSnackBar('Erreur: ' + error.status + error.error.message, false);
        } else {
            if (error.error.includes('Already logged in')) {
                const dialogRef = this.dialog.open(ConfirmWindowComponent, {
                    height: '25%',
                    width: '25%',
                    panelClass: 'matDialogWheat',
                });

                dialogRef.componentInstance.name =
                    'Vous etes actuellement connecte sur une autre machine, voulez vous forcer une connexion?\n ' +
                    'Si vous ete actuellement en match vous abandonnerez votre match';

                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.http
                            .post<any>(this.serverUrl + 'forcelogin', {
                                email,
                                password,
                            })
                            .subscribe({
                                next: (response) => {
                                    socket?.emit('forceLogout', response.data.name);
                                    this.saveUserInfo(response, socket as Socket);
                                },
                                error: (newError) => {
                                    this.handleErrorPOST(newError);
                                },
                            });
                    }
                });
            } else {
                this.notifService.openSnackBar(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.message}`, false);
            }
        }
    }

    private saveUserInfo(response: any, socket: Socket) {
        localStorage.setItem(`cookie-${response.data._id}`, response.token);
        this.updateUserInstance(response.data);
        socket.emit('new-user', response.data.name);
        this.translate.use(response.data.language);
        this.infoClientService.playerName = response.data.name;
        this.router.navigate(['/game-mode-options']);
    }
}
