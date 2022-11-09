/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Component, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { UserService } from '@app/services/user.service';
import { Avatar } from '@app/classes/avatar.interface';
import { GalleryComponent } from '@app/components/gallery/gallery.component';
import { SocketService } from '@app/services/socket.service';
import { InfoClientService } from '@app/services/info-client.service';

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
        username: '',
        email: '',
        password: '',
    };

    isSuccessful = false;
    isSignUpFailed = false;
    errorMessage = '';
    showSignup: boolean = true;

    serverUrl = environment.serverUrl;
    avatars: Avatar[] = [];

    constructor(private userService: UserService, private socketService: SocketService, public infoClientService: InfoClientService) {}

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
        return await this.userService.signUp(
            this.form.username,
            this.form.email,
            this.form.password,
            `avatar${this.galleryComponent.ngxGalleryComponent.selectedIndex + 1}`,
            this.socketService.socket,
        );
    }

    async signIn() {
        return await this.userService.signIn(this.form.email, this.form.password, this.socketService.socket);
    }
}

/* eslint-enable  @typescript-eslint/no-explicit-any */
