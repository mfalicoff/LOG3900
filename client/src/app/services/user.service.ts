import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '@app/classes/user.interface';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserResponseInterface } from '@app/classes/response.interface';

@Injectable({
    providedIn: 'root',
})
export class UserService {
    user: User;

    constructor(private http: HttpClient) {}

    getUser(user: User): Observable<UserResponseInterface> {
        return this.http.get<UserResponseInterface>(`${environment.serverUrl}users/${user.id}`);
    }

    updateUserInstance(user: User) {
        localStorage.removeItem(`user-${user.id}`);
        localStorage.setItem(`user-${user.id}`, JSON.stringify(user));
        this.user = user;
    }

    getCookieHeader(): HttpHeaders {
        return new HttpHeaders().set('Authorization', localStorage.getItem(`cookie-${this.user.id}`)?.split('=')[1].split(';')[0] as string);
    }

    async updateUsername(newName: string) {
        return this.http
            .put<UserResponseInterface>(
                environment.serverUrl + 'users/' + this.user.id,
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
                environment.serverUrl + 'users/' + this.user.id,
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

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
        }
    }
}
