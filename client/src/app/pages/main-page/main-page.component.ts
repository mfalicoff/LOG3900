import { Component, Optional, ViewChild } from '@angular/core';
import { NgForm, NgModel } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    @ViewChild('name') name: NgModel;
    @ViewChild('form') form: NgForm;

    expansionPanelStyleClassic: string;

    constructor(@Optional() public dialog?: MatDialog) {}
}
