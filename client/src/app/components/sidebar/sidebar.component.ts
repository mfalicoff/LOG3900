/* eslint-disable deprecation/deprecation */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import * as Constants from '@app/classes/global-constants';
import { NotificationService } from '@app/services/notification.service';
import { ConfirmWindowComponent } from '@app/components/confirm-window/confirm-window.component';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent implements OnInit, OnDestroy {
    coordsTileToChange: string;
    letterFromReserveChoosed: string;
    idxTileFromStandChoosed: number;
    routerSubscription: Subscription;
    hasAskedForLeave: boolean = false;
    constructor(
        private socketService: SocketService,
        public infoClientService: InfoClientService,
        private router: Router,
        private notifService: NotificationService,
        private dialog: MatDialog,
    ) {
        this.coordsTileToChange = '';
    }

    ngOnInit() {
        this.hasAskedForLeave = false;
        // we weren't able to find an equivalent without using subscribe
        // nothing was working for this specific case
        // pages are handled differently and it doesn't fit our feature
        // TODO find a way to do it better
        // eslint-disable-next-line deprecation/deprecation
        this.routerSubscription = this.router.events.subscribe((event) => {
            const isAtCorrectPage: boolean = event instanceof NavigationStart && this.router.url === '/game';
            if (isAtCorrectPage && !this.infoClientService.game.gameFinished && !this.infoClientService.isSpectator && !this.hasAskedForLeave) {
                const dialogRef = this.dialog.open(ConfirmWindowComponent, {
                    height: '25%',
                    width: '20%',
                    panelClass: 'matDialogWheat',
                });

                dialogRef.componentInstance.name = 'Voulez vous vraiment quitter cette page ? \nCela équivaudrait à un abandon de partie !';

                dialogRef.afterClosed().subscribe((result) => {
                    if (result) {
                        this.socketService.socket.emit('giveUpGame');
                    } else {
                        this.router.navigate(['/game']);
                    }
                });
            }
            if (!this.hasAskedForLeave) {
                this.router.navigate(['/game']);
            }
        });
    }

    ngOnDestroy() {
        this.routerSubscription.unsubscribe();
    }

    onClickGiveUpButton() {
        if (this.infoClientService.isSpectator) {
            return;
        }

        if (this.infoClientService.game.gameFinished) {
            this.notifService.openSnackBar("La game est finie, plus d'abandon possible.", false);
            return;
        }

        this.hasAskedForLeave = true;
        const dialogRef = this.dialog.open(ConfirmWindowComponent, {
            height: '25%',
            width: '20%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.componentInstance.name = 'Voulez vous vraiment abandonner la partie ?';

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.socketService.count = 1;
                this.socketService.socket.emit('giveUpGame');
                this.router.navigate(['/game-mode-options']);
            } else {
                this.hasAskedForLeave = false;
            }
        });
    }

    shouldLeaveGameBe() {
        if (this.infoClientService.isSpectator || this.infoClientService.game.gameFinished || !this.infoClientService.game.gameStarted) {
            return true;
        }

        let answer = true;

        if (this.infoClientService.displayTurn !== "En attente d'un autre joueur...") {
            answer = false;
        }
        return answer;
    }

    leaveGame() {
        this.hasAskedForLeave = true;
        const dialogRef = this.dialog.open(ConfirmWindowComponent, {
            height: '25%',
            width: '20%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.componentInstance.name = 'Voulez vous vraiment quitter cette page ? \nCela équivaudrait à un abandon de partie !';

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                if (this.infoClientService.game.gameMode === 'Ranked' && this.infoClientService.game.gameFinished) {
                    this.socketService.count = 1;
                    this.socketService.socket.emit('leaveRankedGame', this.infoClientService.player);
                }
                this.socketService.socket.emit('leaveGame');
                this.socketService.count = 1;
                this.router.navigate(['/game-mode-options']);
            } else {
                this.hasAskedForLeave = false;
            }
        });
    }

    startGame() {
        this.socketService.socket.emit('startGame', this.infoClientService.game.roomName);
        this.infoClientService.creatorShouldBeAbleToStartGame = false;
    }

    shouldSpecBeAbleToBePlayer() {
        if (this.infoClientService.game.gameFinished || !this.infoClientService.isSpectator) {
            return false;
        }
        const nbVirtualPlayer = Array.from(this.infoClientService.actualRoom.players).filter((player) => player.id === 'virtualPlayer').length;
        if (nbVirtualPlayer > 0) {
            return true;
        } else {
            return false;
        }
    }

    spectWantsToBePlayer() {
        this.socketService.socket.emit('spectWantsToBePlayer');
    }

    showPowerList() {
        this.infoClientService.displayPowerModal = 'block';
    }

    hidePowerModal() {
        this.infoClientService.displayPowerModal = 'none';
    }

    onPowerCardClick(powerCardName: string) {
        this.socketService.socket.emit('requestLetterReserve');
        switch (powerCardName) {
            case Constants.TRANFORM_EMPTY_TILE: {
                this.infoClientService.displayTransformTileModal = 'block';
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER: {
                this.infoClientService.displayExchLetterModal = 'block';
                break;
            }
            case Constants.EXCHANGE_STAND: {
                this.infoClientService.displayExchStandModal = 'block';
                break;
            }
            default: {
                this.infoClientService.powerUsedForTurn = true;
                this.socketService.socket.emit('powerCardClick', powerCardName, '');
                break;
            }
        }
        this.hidePowerModal();
    }

    onExchangeStandChoice(playerName: string) {
        this.infoClientService.powerUsedForTurn = true;
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_STAND, playerName);
        this.infoClientService.displayExchStandModal = 'none';
    }
    onChooseLetterToExchange(id: number) {
        this.idxTileFromStandChoosed = id;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const letterElement = document.getElementById(id.toString())!;
        letterElement.style.backgroundColor = '#0C483F';
        letterElement.style.color = 'wheat';
        for (let i = 0; i < this.infoClientService.player.stand.length; i++) {
            if (i === id) {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const otherLetterElement = document.getElementById(i.toString())!;
            otherLetterElement.style.backgroundColor = 'wheat';
            otherLetterElement.style.color = '#0C483F';
        }
    }
    onChooseLetterToTakeFromReserve(id: number, choosedLetter: string) {
        this.letterFromReserveChoosed = choosedLetter;
        const addOnForReserve = 7;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const letterElement = document.getElementById((id + addOnForReserve).toString())!;
        letterElement.style.backgroundColor = '#0C483F';
        letterElement.style.color = 'wheat';
        for (let i = 0; i < this.infoClientService.letterReserve.length; i++) {
            if (i === id) {
                continue;
            }
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const otherLetterElement = document.getElementById((i + addOnForReserve).toString())!;
            otherLetterElement.style.backgroundColor = 'wheat';
            otherLetterElement.style.color = '#0C483F';
        }
    }

    activateLetterExchange() {
        const additionalParams = this.letterFromReserveChoosed + this.idxTileFromStandChoosed.toString();
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_LETTER_JOKER, additionalParams);
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayExchLetterModal = 'none';
    }

    validateTileChangeCoords() {
        const idxLine: number =
            this.coordsTileToChange.slice(0, Constants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - Constants.ASCII_CODE_SHIFT;
        const idxColumn = Number(this.coordsTileToChange.slice(Constants.END_POSITION_INDEX_LINE, this.coordsTileToChange.length));
        if (
            !idxLine ||
            !idxColumn ||
            idxLine <= 0 ||
            idxColumn <= 0 ||
            idxLine > Constants.NUMBER_SQUARE_H_AND_W ||
            idxColumn > Constants.NUMBER_SQUARE_H_AND_W
        ) {
            this.notifService.openSnackBar('Coordonnées invalides. Le format doit être (ligne-colonne). Exemple: e10', false);
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].letter.value !== '') {
            this.notifService.openSnackBar("Cette case n'est pas vide. Veuillez choisir une autre case.", false);
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].bonus !== 'xx') {
            this.notifService.openSnackBar('Cette case possède déjà un bonus. Veuillez choisir une autre case.', false);
            return;
        }
        this.socketService.socket.emit('powerCardClick', Constants.TRANFORM_EMPTY_TILE, idxLine.toString() + '-' + idxColumn.toString());
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayTransformTileModal = 'none';
    }
}
