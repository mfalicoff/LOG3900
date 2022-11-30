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
        public themeService: DarkModeService,
    ) {
        this.translate.setDefaultLang('fr');
        this.translate.use('fr');
        this.themeService?.disable();
        if (this.router.url === '/game' && (document.getElementById('hideInGame') as HTMLElement) !== undefined) {
            (document.getElementById('hideInGame') as HTMLElement).style.display = 'none';
        }
    }

    goingBack() {
        history.back();
    }
}
