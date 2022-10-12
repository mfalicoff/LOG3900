import { Component, ViewChild } from '@angular/core';
import { UserService } from '@app/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { GalleryComponent } from '@app/components/gallery/gallery.component';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    name = '';

    constructor(private userService: UserService, private dialog: MatDialog) {}

    getUsername() {
        return this.userService.getUserFromStorage().name;
    }

    async updateUsername() {
        await this.userService.updateUsername(this.name);
    }

    async updateAvatar() {
        await this.userService.updateAvatar(this.galleryComponent.ngxGalleryComponent.selectedIndex);
    }

    closeDialog() {
        this.dialog.closeAll();
    }
}
