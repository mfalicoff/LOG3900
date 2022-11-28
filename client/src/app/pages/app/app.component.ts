import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { DarkModeService } from 'angular-dark-mode';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(
        private translate: TranslateService,
        public infoClientService: InfoClientService,
        public router: Router,
        private themeService: DarkModeService,
    ) {
        this.translate.setDefaultLang('fr');
        this.translate.use('fr');
        this.themeService.darkMode$.subscribe();
        if (this.router.url === '/game') {
            (document.getElementById('hideInGame') as HTMLElement).style.display = 'none';
        }
    }

    goingBack() {
        if (this.router.url === '/login') {
            this.router.navigate(['/home']);
        } else {
            history.back();
        }
    }
}
