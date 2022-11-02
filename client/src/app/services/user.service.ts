import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@app/classes/user.interface';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserResponseInterface } from '@app/classes/response.interface';
import { GameSaved } from '@app/classes/game-saved';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: User;

    constructor(private http: HttpClient) {}

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
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
        }
    }
}
