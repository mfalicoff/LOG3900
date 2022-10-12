import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '@app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { NgxGalleryAnimation, NgxGalleryComponent, NgxGalleryImage, NgxGalleryOptions } from '@kolkov/ngx-gallery';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface Avatar {
    uri: string;
}

interface AvatarInterfaceRes {
    data: Avatar[];
    message: string;
}

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent implements OnInit {
    @ViewChild(NgxGalleryComponent) ngxGalleryComponent: NgxGalleryComponent;

    name = '';
    serverUrl = environment.serverUrl;
    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    private avatars: Avatar[];

    constructor(private userService: UserService, private dialog: MatDialog, private http: HttpClient) {}

    ngOnInit(): void {
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

    getUsername() {
        return this.userService.getUserFromStorage().name;
    }

    async updateUsername() {
        await this.userService.updateUsername(this.name);
    }

    async updateAvatar() {
        await this.userService.updateAvatar(this.ngxGalleryComponent.selectedIndex);
    }

    closeDialog() {
        this.dialog.closeAll();
    }
}
