import { Component, OnInit } from '@angular/core';
import { UserService } from '@app/services/user.service';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-profile-edit',
    templateUrl: './profile-edit.component.html',
    styleUrls: ['./profile-edit.component.scss'],
})
export class ProfileEditComponent implements OnInit {
    name = '';
    constructor(private userService: UserService, private dialog: MatDialog) {}

    ngOnInit(): void {}

    getUsername() {
        return this.userService.getUserFromStorage().name;
    }

    async updateUsername() {
        await this.userService.updateUsername(this.name);
    }

    closeDialog() {
        this.dialog.closeAll();
    }
}
