import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { SocketService } from '@app/services/socket.service';
import { MatDialog } from '@angular/material/dialog';
import { EndGameResultsPageComponent } from '@app/pages/end-game-results-page/end-game-results-page.component';

@Component({
    selector: 'app-game-page',
    templateUrl: './game-page.component.html',
    styleUrls: ['./game-page.component.scss'],
})
export class GamePageComponent {
    constructor(
        private socketService: SocketService,
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        private router: Router,
        public infoClientService: InfoClientService,
        private dialog: MatDialog,
    ) {
        // we weren't able to find an equivalent without using subscribe
        // nothing was working for this specific case
        // pages are handled differently and it doesn't fit our feature
        // TODO find a way to do it better
        // eslint-disable-next-line deprecation/deprecation
        router.events.subscribe((event) => {
            const isAtCorrectPage: boolean = event instanceof NavigationStart && this.router.url === '/game';
            if (isAtCorrectPage && !this.infoClientService.game.gameFinished && !this.infoClientService.isSpectator) {
                const resultLeave = confirm('Voulez vous vraiment quitter cette page ? \nCela équivaudrait à un abandon de partie !');
                if (!resultLeave) {
                    this.router.navigate(['/game']);
                } else {
                    this.socketService.socket.emit('giveUpGame');
                }
            }
        });
    }

    openDialogWindow(): void {
        this.dialog.open(EndGameResultsPageComponent, {
            panelClass: 'matDialogWheat',
            disableClose: true,
            hasBackdrop: false,
            height: '80%',
            width: '80%',
        });
    }

    onLeftClickGamePage() {
        this.mouseKeyboardEventHandler.onLeftClickGamePage();
    }

    isPlayerIncomming() {
        if (this.infoClientService.incommingPlayer === '') {
            return 'none';
        } else {
            return 'block';
        }
    }

    acceptPlayer(isPlayerAccepted: boolean) {
        if (isPlayerAccepted) {
            this.socketService.socket.emit('acceptPlayer', true, this.infoClientService.incommingPlayerId);
        } else {
            this.socketService.socket.emit('acceptPlayer', false, this.infoClientService.incommingPlayerId);
        }

        this.infoClientService.incommingPlayer = '';
        this.infoClientService.incommingPlayerId = '';
    }
}
