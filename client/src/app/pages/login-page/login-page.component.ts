/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { environment } from 'src/environments/environment';

interface FormInterface {
    username: string;
    email: string;
    password: string;
}

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    form: FormInterface = {
        username: '',
        email: '',
        password: '',
    };
    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    showSignup: boolean = true;

    serverUrl = environment.serverUrl;

    constructor(private http: HttpClient, private infoClientService: InfoClientService, private router: Router) {}

    ngOnInit(): void {}

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
        return this.http
            .post<any>(
                this.serverUrl + 'signup',
                {
                    name: this.form.username,
                    email: this.form.email,
                    password: this.form.password,
                },
                { withCredentials: true },
            )
            .subscribe({
                next: (data) => {
                    this.infoClientService.playerName = data.data.name;
                    this.router.navigate(['/chat']);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async signIn() {
        return this.http
            .post<any>(this.serverUrl + 'login', {
                email: this.form.email,
                password: this.form.password,
            })
            .subscribe({
                next: (response) => {
                    localStorage.setItem('cookie', response.token);
                    this.infoClientService.playerName = response.data.name;
                    this.router.navigate(['/chat']);
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

/* eslint-enable  @typescript-eslint/no-explicit-any */
