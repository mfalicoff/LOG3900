import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';
import * as GlobalConstants from '@app/classes/global-constants';
import { UserService } from '@app/services/user.service';

@Component({
    selector: 'app-gamemodeoptions-page',
    templateUrl: './gamemodeoptions-page.component.html',
    styleUrls: ['./gamemodeoptions-page.component.scss'],
})
export class GamemodeoptionsPageComponent {
    constructor(private infoClientService: InfoClientService, public userService: UserService) {}

    onClickMulti(mode: string) {
        this.infoClientService.gameMode = GlobalConstants.MODE_MULTI;
        this.infoClientService.isLog2990Enabled = mode !== 'classic';
    }
}
