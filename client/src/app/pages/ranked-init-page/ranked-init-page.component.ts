import { Component } from '@angular/core';
import { InfoClientService } from '@app/services/info-client.service';

@Component({
    selector: 'app-ranked-init-page',
    templateUrl: './ranked-init-page.component.html',
    styleUrls: ['./ranked-init-page.component.scss'],
})
export class RankedInitPageComponent {
    constructor(public infoClientService: InfoClientService){

    }
    eloDisparity: number = 60;

    onEloDisparityChange(value: any) {
        this.eloDisparity = value.value;
    }
    onConfirm() {
        this.infoClientService.eloDisparity = this.eloDisparity;
    }
}