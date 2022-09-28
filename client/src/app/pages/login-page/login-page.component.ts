/* eslint-disable  @typescript-eslint/no-explicit-any */
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { environment } from 'src/environments/environment';
// import { map } from "rxjs/operators";

@Component({
    selector: 'app-login-page',
    templateUrl: './login-page.component.html',
    styleUrls: ['./login-page.component.scss'],
})
export class LoginPageComponent implements OnInit {
    form: any = {
        username: null,
        email: 'twoswaglol.law@gmail.com',
        password: '123456',
    };
    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    showSignup: boolean = true;

    serverUrl = environment.serverUrl;

    constructor(private http: HttpClient, private infoClientService: InfoClientService, private router: Router) {}

    ngOnInit(): void {}

    onSubmit(): void {
        let response: any;
        if (this.showSignup) {
            response = this.signUp();
        } else {
            response = this.signIn();
        }
        setTimeout(() => {
            console.log(document.cookie);
            console.log(response);
            console.log(response.cookies);
            console.log(response.cookie);
            console.log(response.headers);
            console.log(response.header);
        }, 1000);
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
                    console.log(data);
                    this.infoClientService.playerName = data.data.name;
                    this.router.navigate(['/chat']);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
    }

    async signIn() {
        const headers = new HttpHeaders();
        headers.set('Content-Type', 'application/json; charset=UTF-8');

        return this.http
            .post<any>(
                this.serverUrl + 'login',
                {
                    email: this.form.email,
                    password: this.form.password,
                },
                { headers, observe: 'response', withCredentials: true },
            )
            .subscribe({
                next: (response) => {
                    console.log(response);
                    console.log(response.headers.get('Set-Cookie'));
                    this.infoClientService.playerName = response.body.data.name;
                    this.router.navigate(['/chat']);
                },
                error: (error) => {
                    this.handleErrorPOST(error);
                },
            });
        // return fetch(this.serverUrl + 'login', {
        //     mode: 'no-cors',
        //     body:JSON.stringify({
        //         email: this.form.email,
        //         password: this.form.password,
        //     }),
        //     credentials: 'include',
        //     method: 'POST',
        //     headers: {'Content-Type': 'application/json; charset=UTF-8'}
        // })
        //     .then(response => response.json())
        //     .then(json => console.log(json))
        //     .catch(error => console.log('Authorization failed : ' + error.message));
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
