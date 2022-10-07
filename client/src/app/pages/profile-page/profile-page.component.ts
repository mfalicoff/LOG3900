import { Component, OnInit } from '@angular/core';
import { User } from '@app/classes/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { ActionHistoryComponent } from '@app/pages/profile-page/action-history/action-history.component';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    user: User = JSON.parse(localStorage.getItem('user-info') as string);

    constructor(private dialog: MatDialog) {}

    ngOnInit(): void {}

    openActionHistoryComponent(): void {
        this.dialog.open(ActionHistoryComponent, {
            height: '75%',
            width: '75%',
        });
    }
}
