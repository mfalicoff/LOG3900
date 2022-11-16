import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserHistoryComponent } from '@app/components/user-history/user-history.component';
import { UserService } from '@app/services/user.service';
import { ProfileEditComponent } from '@app/pages/profile-page/profile-edit/profile-edit.component';
import { Subscription } from 'rxjs';
import { GameSaved } from '@app/classes/game-saved';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-profile-page',
    templateUrl: './profile-page.component.html',
    styleUrls: ['./profile-page.component.scss'],
})
export class ProfilePageComponent implements OnInit, OnDestroy {
    favourtieGamesSubscription: Subscription;
    favouriteGames: GameSaved[];
    langList: string[];
    langSelected: string | undefined;

    langMap = new Map<string, string>([
        ['Français', 'fr'],
        ['English', 'en'],
    ]);

    inverseLangMap = new Map<string, string>([
        ['fr', 'Français'],
        ['en', 'English'],
    ]);

    constructor(private dialog: MatDialog, public userService: UserService, private translate: TranslateService) {}

    ngOnInit() {
        this.favourtieGamesSubscription = this.userService.getFavouriteGames().subscribe((res: GameSaved[]) => {
            this.favouriteGames = res.copyWithin(0, 0);
        });
        this.langList = ['Français', 'English'];
        this.langSelected = this.inverseLangMap.get(this.translate.currentLang);
    }

    ngOnDestroy() {
        this.favourtieGamesSubscription.unsubscribe();
    }

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
            width: '60%',
            data: {
                title: 'Parties favorites',
                data: this.favouriteGames,
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

    onClickLang(lang: string): void {
        this.userService.updateLanguage(this.langMap.get(lang) as string);
        this.translate.use(this.langMap.get(lang) as string);
    }
}
