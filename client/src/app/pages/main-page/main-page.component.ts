import { Component, Optional, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import * as GlobalConstants from '@app/classes/global-constants';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    @ViewChild('name') name: NgModel;
    @ViewChild('form') form: NgForm;

    submitted: boolean;
    expansionPanelStyleClassic: string;

    constructor(private socketService: SocketService, private infoClientService: InfoClientService, @Optional() public dialog?: MatDialog) {
        this.submitted = false;
    }

    onSubmit() {
        this.infoClientService.playerName = this.name.value;
        this.socketService.socket.emit('new-user', this.name.value);
        this.submitted = !this.submitted;
    }

    onClickMulti(mode: string) {
        this.infoClientService.gameMode = GlobalConstants.MODE_MULTI;
        this.infoClientService.isLog2990Enabled = mode !== 'classic';
    }

    noNameError() {
        if (!this.submitted) {
            alert("Il faut d'abord entrer un nom !");
        }
    }
}
