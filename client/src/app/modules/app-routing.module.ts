import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { ChatComponent } from '@app/pages/chat/chat.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { GamemodeoptionsPageComponent } from '@app/pages/gamemodeoptions-page/gamemodeoptions-page.component';
import { LeaderboardPageComponent } from '@app/pages/leaderboard-page/leaderboard-page.component';
import { LoginPageComponent } from '@app/pages/login-page/login-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { MultiplayerInitPageComponent } from '@app/pages/multiplayer-init-page/multiplayer-init-page.component';
import { ParametresSelectionPageComponent } from '@app/pages/parametres-selection-page/parametres-selection-page.component';
import { RankedInitPageComponent } from '@app/pages/ranked-init-page/ranked-init-page.component';
import { RankedMatchmakingPageComponent } from '@app/pages/ranked-matchmaking-page/ranked-matchmaking-page.component';

const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' },
    { path: 'home', component: MainPageComponent },
    { path: 'game', component: GamePageComponent },
    { path: 'material', component: MaterialPageComponent },
    { path: 'param-select', component: ParametresSelectionPageComponent },
    { path: 'multiplayer-init', component: MultiplayerInitPageComponent },
    { path: 'ranked-init', component: RankedInitPageComponent },
    { path: 'ranked-matchmaking', component: RankedMatchmakingPageComponent },
    { path: 'leaderboard', component: LeaderboardPageComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: 'chat', component: ChatComponent },
    { path: 'login', component: LoginPageComponent },
    { path: 'gamemode-options', component: GamemodeoptionsPageComponent },
    { path: '**', redirectTo: '/home' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
