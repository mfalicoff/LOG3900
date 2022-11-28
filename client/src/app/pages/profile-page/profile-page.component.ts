import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserHistoryComponent } from '@app/components/user-history/user-history.component';
import { UserService } from '@app/services/user.service';
import { ProfileEditComponent } from '@app/pages/profile-page/profile-edit/profile-edit.component';
import { Observable, Subscription } from 'rxjs';
import { GameSaved } from '@app/classes/game-saved';
import { TranslateService } from '@ngx-translate/core';
import { SocketService } from '@app/services/socket.service';
import { DarkModeService } from 'angular-dark-mode';

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
    themeList: string[];
    themeSelected: string | undefined;

    langMap = new Map<string, string>([
        ['Français', 'fr'],
        ['English', 'en'],
    ]);

    inverseLangMap = new Map<string, string>([
        ['fr', 'Français'],
        ['en', 'English'],
    ]);

    themeMap = new Map<string, string>([
        ['Light', 'lt'],
        ['Dark', 'dk'],
    ]);

    inverseThemeMap = new Map<string, string>([
        ['lt', 'Light'],
        ['dk', 'Dark'],
    ]);

    constructor(
        private dialog: MatDialog,
        public userService: UserService,
        private translate: TranslateService,
        private themeService: DarkModeService,
        private socketService: SocketService,
    ) {}

    ngOnInit() {
        this.favourtieGamesSubscription = this.userService.getFavouriteGames().subscribe((res: GameSaved[]) => {
            this.favouriteGames = res.copyWithin(0, 0);
        });
        this.langList = ['Français', 'English'];
        this.langSelected = this.inverseLangMap.get(this.translate.currentLang);
        this.themeList = ['Light', 'Dark'];
        this.themeService.darkMode$.subscribe((data) => {
            if (data) {
                this.themeSelected = this.inverseThemeMap.get('dk');
            } else {
                this.themeSelected = this.inverseThemeMap.get('lt');
            }
        });
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
            height: '90%',
            width: '50%',
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
        const language = this.langMap.get(lang) as string;
        this.userService.updateLanguage(language);
        this.socketService.socket.emit('changeLanguage', this.userService.user.name, language);
        this.translate.use(language);
    }

    onClickTheme(theme: string): void {
        const themeSelect = this.themeMap.get(theme) as string;
        this.themeService.darkMode$.subscribe((data) => {
            if (data && this.themeSelected !== 'Dark') {
                this.themeService.toggle();
            } else if (!data && this.themeSelected !== 'Light') {
                this.themeService.toggle();
            }
        });
        this.userService.updateTheme(themeSelect);
        this.socketService.socket.emit('changeTheme', this.userService.user.name, themeSelect);
    }
}
