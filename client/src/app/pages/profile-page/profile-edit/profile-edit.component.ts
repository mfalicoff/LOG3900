import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GalleryComponent } from '@app/components/gallery/gallery.component';
import { SocketService } from '@app/services/socket.service';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    name = '';

    constructor(private userService: UserService, private dialog: MatDialog, private socketService: SocketService) {}

    getUsername() {
        return this.userService.user.name;
    }

    async updateUsername() {
        await this.userService.updateUsername(this.name);
    }

    async updateAvatar() {
        console.time("1");
        await this.userService.updateAvatar(this.galleryComponent.ngxGalleryComponent.selectedIndex, this.socketService.socket);
        console.timeEnd("1");
    }

    closeDialog() {
        this.dialog.closeAll();
    }
}
