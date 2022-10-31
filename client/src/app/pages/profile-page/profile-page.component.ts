import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserHistoryComponent } from '@app/components/user-history/user-history.component';
import { UserService } from '@app/services/user.service';
import { ProfileEditComponent } from '@app/pages/profile-page/profile-edit/profile-edit.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
    favourtieGamesSubscription: Subscription;
    constructor(private dialog: MatDialog, public userService: UserService) {}

    ngOnInit() {}

    ngOnDestroy() {}

    openActionHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: 'Historique des connections',
                data: this.userService.user.actionHistory,
                isFavouriteGames: false,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openGameHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: 'Historique des Parties',
                data: this.userService.user.gameHistory,
                isFavouriteGames: false,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openFavouriteGamesComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: 'Parties favorites',
                data: this.userService.user.favouriteGames,
                isFavouriteGames: true,
            },
            panelClass: 'matDialogWheat',
        });
    }

    openEditProfileComponent(): void {
        this.dialog.open(ProfileEditComponent, {
            height: '75%',
            width: '75%',
            panelClass: 'matDialogWheat',
        });
    }

    millisToMinutesAndSeconds() {
        const date = new Date(this.userService.user.averageTimePerGame as number);
        const m = date.getMinutes();
        const s = date.getSeconds();
        return `${m}m:${s}s.`;
    }
}
