import { Component } from '@angular/core';

@Component({
    selector: 'app-ranked-init-page',
    templateUrl: './ranked-init-page.component.html',
    styleUrls: ['./ranked-init-page.component.scss'],
})
export class RankedInitPageComponent {
    eloDisparity: number = 60;

    onEloDisparityChange(value: any) {
        this.eloDisparity = value.value;
        console.log(this.eloDisparity);
    }
}