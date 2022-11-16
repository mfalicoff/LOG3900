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

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: User;
    serverUrl = environment.serverUrl;

    constructor(private http: HttpClient, private infoClientService: InfoClientService, private router: Router) {}

    getUser(user: User): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${environment.serverUrl}users/${user._id}`);
    }

    updateUserInstance(user: User) {
        localStorage.removeItem('user');
        localStorage.setItem('user', JSON.stringify(user));
        this.user = user;
    }

    getCookieHeader(): HttpHeaders {
        return new HttpHeaders().set('Authorization', localStorage.getItem('cookie')?.split('=')[1].split(';')[0] as string);
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
                    this.handleErrorPOST(error);
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
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async softLogin(socket: Socket) {
        this.http
            .post<unknown>(
                environment.serverUrl + 'soft-login',
                {},
                {
                    headers: this.getCookieHeader(),
                },
            )
            // eslint-disable-next-line deprecation/deprecation
            .subscribe({
                next: (response) => {
                    this.saveUserInfo(response, socket);
                },
                error: (error) => {
                    console.error(error);
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
                    localStorage.removeItem('cookie');
                    localStorage.removeItem('user');
                    this.infoClientService.playerName = '';
                    this.router.navigate(['/login']);
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

    async updateAvatar(newAvatarIndex: number) {
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

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.message}`);
        }
    }

    private saveUserInfo(response: any, socket: Socket) {
        localStorage.setItem('cookie', response.token);
        this.updateUserInstance(response.data);
        socket.emit('new-user', response.data.name);
        this.infoClientService.playerName = response.data.name;
        this.router.navigate(['/game-mode-options']);
    }
}
