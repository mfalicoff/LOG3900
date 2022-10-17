/* tslint:disable:no-unused-variable */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EndGameResultsPageComponent } from './end-game-results-page.component';

describe('EndGameResultsPageComponent', () => {
    let component: EndGameResultsPageComponent;
    let fixture: ComponentFixture<EndGameResultsPageComponent>;

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                declarations: [EndGameResultsPageComponent],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        fixture = TestBed.createComponent(EndGameResultsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
