/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { environment } from 'src/environments/environment';
import { UserService } from '@app/services/user.service';
import { Avatar } from '@app/classes/avatar.interface';
import { GalleryComponent } from '@app/components/gallery/gallery.component';

interface FormInterface {
    avatar: string;
    username: string;
    email: string;
    password: string;
}

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    form: FormInterface = {
        avatar: '',
        username: 'example@email.com',
        email: '',
        password: 'password',
    };

    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    showSignup: boolean = true;

    serverUrl = environment.serverUrl;
    avatars: Avatar[] = [];

    constructor(
        private http: HttpClient,
        private infoClientService: InfoClientService,
        private router: Router,
        private socketService: SocketService,
        private userService: UserService,
    ) {}

    onSubmit(): void {
        if (this.showSignup) {
            this.signUp();
        } else {
            this.signIn();
        }
    }
    toggleShow() {
        this.showSignup = !this.showSignup;
    }

    async signUp() {
        return (
            this.http
                .post<any>(
                    this.serverUrl + 'signup',
                    {
                        name: this.form.username,
                        email: this.form.email,
                        password: this.form.password,
                        avatarPath: `avatar${this.galleryComponent.ngxGalleryComponent.selectedIndex + 1}`,
                    },
                    { withCredentials: true },
                )
                // eslint-disable-next-line deprecation/deprecation
                .subscribe({
                    next: () => {
                        this.http
                            .post<any>(this.serverUrl + 'login', {
                                email: this.form.email,
                                password: this.form.password,
                            })
                            // eslint-disable-next-line deprecation/deprecation
                            .subscribe({
                                next: (response) => {
                                    this.saveUserInfo(response);
                                },
                                error: (error) => {
                                    this.handleErrorPOST(error);
                                },
                            });
                    },
                    error: (error) => {
                        this.handleErrorPOST(error);
                    },
                })
        );
    }

    async signIn() {
        return (
            this.http
                .post<any>(this.serverUrl + 'login', {
                    email: this.form.email,
                    password: this.form.password,
                })
                // eslint-disable-next-line deprecation/deprecation
                .subscribe({
                    next: (response) => {
                        this.saveUserInfo(response);
                    },
                    error: (error) => {
                        this.handleErrorPOST(error);
                    },
                })
        );
    }

    private saveUserInfo(response: any) {
        localStorage.setItem('cookie', response.token);
        this.userService.updateUserInstance(response.data);
        this.socketService.socket.emit('new-user', response.data.name);
        this.infoClientService.playerName = response.data.name;
        this.router.navigate(['/gamemode-options']);
    }

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
        }
    }
}

/* eslint-enable  @typescript-eslint/no-explicit-any */
