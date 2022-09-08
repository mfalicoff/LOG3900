import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent {
    constructor(public infoClientService: InfoClientService) {}
}
