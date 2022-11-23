import { Component, Optional, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    @ViewChild('name') name: NgModel;
    @ViewChild('form') form: NgForm;

    expansionPanelStyleClassic: string;

    constructor(public infoClientService: InfoClientService, @Optional() public dialog?: MatDialog) {}
}
