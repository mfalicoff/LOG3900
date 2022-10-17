import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameModeOptionsPageComponent } from './game-mode-options-page.component';

describe('GameModeOptionsPageComponent', () => {
    let component: GameModeOptionsPageComponent;
    let fixture: ComponentFixture<GameModeOptionsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GameModeOptionsPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GameModeOptionsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
