/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { environment } from 'src/environments/environment';
import { UserService } from '@app/services/user.service';
import { NgxGalleryAnimation, NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';

interface FormInterface {
    avatar: string;
    username: string;
    email: string;
    password: string;
}

interface Avatar {
    uri: string;
}

interface AvatarInterfaceRes {
    data: Avatar[];
    message: string;
}

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    @ViewChild(NgxGalleryComponent) ngxGalleryComponent: NgxGalleryComponent;

    form: FormInterface = {
        avatar: '',
        username: 'example@email.com',
        email: '',
        password: 'password',
    };

    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];

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

    async ngOnInit() {
        this.http.get<AvatarInterfaceRes>(this.serverUrl + 'avatar').subscribe((res: AvatarInterfaceRes) => {
            this.avatars = res.data;
            this.galleryOptions = [
                {
                    width: '300px',
                    height: '400px',
                    imageAnimation: NgxGalleryAnimation.Slide,
                    image: true,
                    fullWidth: false,
                    preview: false,
                    thumbnailsColumns: 4,
                    thumbnailsRows: 2,
                    thumbnailsMargin: 5,
                    thumbnailsPercent: 75,
                    imagePercent: 125,
                },
            ];
            this.galleryImages = [
                {
                    small: this.avatars[0].uri,
                    medium: this.avatars[0].uri,
                },
                {
                    small: this.avatars[1].uri,
                    medium: this.avatars[1].uri,
                },
                {
                    small: this.avatars[2].uri,
                    medium: this.avatars[2].uri,
                },
                {
                    small: this.avatars[3].uri,
                    medium: this.avatars[3].uri,
                },
                {
                    small: this.avatars[4].uri,
                    medium: this.avatars[4].uri,
                },
                {
                    small: this.avatars[5].uri,
                    medium: this.avatars[5].uri,
                },
                {
                    small: this.avatars[6].uri,
                    medium: this.avatars[6].uri,
                },
                {
                    small: this.avatars[7].uri,
                    medium: this.avatars[7].uri,
                },
            ];
        });
    }

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
        this.form.avatar = `avatar${this.ngxGalleryComponent.selectedIndex + 1}`;
        return (
            this.http
                .post<any>(
                    this.serverUrl + 'signup',
                    {
                        name: this.form.username,
                        email: this.form.email,
                        password: this.form.password,
                        avatarPath: this.form.avatar,
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

    test() {
        console.log(this.ngxGalleryComponent.selectedIndex);
    }
}

/* eslint-enable  @typescript-eslint/no-explicit-any */
