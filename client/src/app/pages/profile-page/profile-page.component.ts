import { Component, OnInit } from '@angular/core';
import { User } from '@app/classes/user.interface';
import { MatDialog } from '@angular/material/dialog';
import { UserHistoryComponent } from '@app/components/user-history/user-history.component';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit {
    user: User = JSON.parse(localStorage.getItem('user-info') as string) as User;

    constructor(private dialog: MatDialog, private userService: UserService) {}

    ngOnInit(): void {
        this.userService.getUser(JSON.parse(localStorage.getItem('user-info') as string) as User).subscribe((data) => {
            console.log(data);
            this.user = data.data;
        });
    }

    openActionHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: 'Historique des connections',
                data: this.user.actionHistory,
            },
        });
    }

    openGameHistoryComponent(): void {
        this.dialog.open(UserHistoryComponent, {
            height: '75%',
            width: '75%',
            data: {
                title: 'Historique des Parties',
                data: this.user.gameHistory,
            },
        });
    }

    millisToMinutesAndSeconds() {
        const date = new Date(this.user.averageTimePerGame as number);
        const m = date.getMinutes();
        const s = date.getSeconds();
        return `Le temps moyen par partie est de: ${m}m:${s}s.`;
    }
}
