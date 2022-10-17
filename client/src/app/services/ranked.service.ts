import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class RankedService {
    matchFound:boolean;
    constructor() {
        this.matchFound = false;
    }

    matchHasBeenFound() {
        this.matchFound= true;
    }
}