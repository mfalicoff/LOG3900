import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    constructor(public infoClientService: InfoClientService, public router: Router) {
        if (this.router.url === '/game') {
            (document.getElementById('hideInGame') as HTMLElement).style.display = 'none';
        }
    }
}
