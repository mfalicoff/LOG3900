import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { BoardStandComponent } from '@app/components/board-stand/board-stand.component';
import { CommunicationBoxComponent } from '@app/components/communication-box/communication-box.component';
import { InfoPanelComponent } from '@app/components/info-panel/info-panel.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TimerComponent } from '@app/components/timer/timer.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { AppComponent } from '@app/pages/app/app.component';
import { GamePageComponent } from '@app/pages/game-page/game-page.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { MaterialPageComponent } from '@app/pages/material-page/material-page.component';
import { MultiplayerInitPageComponent } from '@app/pages/multiplayer-init-page/multiplayer-init-page.component';
import { ParametresSelectionPageComponent } from '@app/pages/parametres-selection-page/parametres-selection-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { GameModeOptionsPageComponent } from './pages/game-mode-options-page/game-mode-options-page.component';
import { LeaderboardPageComponent } from './pages/leaderboard-page/leaderboard-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ModalComponent } from './pages/modal/modal.component';
import { ChatComponent } from './pages/chat/chat.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { UserHistoryComponent } from './components/user-history/user-history.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { ProfileEditComponent } from './pages/profile-page/profile-edit/profile-edit.component';
// eslint-disable-next-line import/no-unresolved
import { NgxGalleryModule } from '@kolkov/ngx-gallery';
import { GalleryComponent } from './components/gallery/gallery.component';
import { EndGameResultsPageComponent } from './pages/end-game-results-page/end-game-results-page.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        GamePageComponent,
        MainPageComponent,
        SidebarComponent,
        MaterialPageComponent,
        BoardStandComponent,
        ParametresSelectionPageComponent,
        MultiplayerInitPageComponent,
        CommunicationBoxComponent,
        TimerComponent,
        InfoPanelComponent,
        LeaderboardPageComponent,
        AdminPageComponent,
        ModalComponent,
        ChatComponent,
        LoginPageComponent,
        GameModeOptionsPageComponent,
        ProfilePageComponent,
        UserHistoryComponent,
        ProfileEditComponent,
        GalleryComponent,
        EndGameResultsPageComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        RouterModule,
        MatGridListModule,
        NgxGalleryModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
