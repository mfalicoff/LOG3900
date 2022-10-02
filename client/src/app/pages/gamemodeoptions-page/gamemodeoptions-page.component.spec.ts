import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GamemodeoptionsPageComponent } from './gamemodeoptions-page.component';

describe('GamemodeoptionsPageComponent', () => {
    let component: GamemodeoptionsPageComponent;
    let fixture: ComponentFixture<GamemodeoptionsPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GamemodeoptionsPageComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamemodeoptionsPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
