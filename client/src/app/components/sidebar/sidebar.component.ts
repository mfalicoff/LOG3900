/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import * as Constants from '@app/classes/global-constants';

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    coordsTileToChange: string;
    letterFromReserveChoosed: string;
    idxTileFromStandChoosed: number;
    constructor(private socketService: SocketService, public infoClientService: InfoClientService, private router: Router) {
        this.coordsTileToChange = '';
    }

    onClickGiveUpButton() {
        if (this.infoClientService.isSpectator) {
            return;
        }

        if (this.infoClientService.game.gameFinished) {
            alert("La game est finie, plus d'abandon possible.");
            return;
        }
        const resultLeave = confirm('Voulez vous vraiment abandonner la partie ?');
        if (!resultLeave) {
            return;
        }
        this.socketService.count = 1;
        this.socketService.socket.emit('giveUpGame');
        this.router.navigate(['/game-mode-options']);
    }

    // finishGameClick() {
    //     if (this.infoClientService.isSpectator) {
    //         return;
    //     }

    //     if (!this.infoClientService.game.gameFinished) {
    //         return;
    //     }
    //     this.router.navigate(['/game-mode-options']);
    // }

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
        if (this.infoClientService.game.gameMode === 'Ranked' && this.infoClientService.game.gameFinished) {
            this.socketService.count = 1;
            this.socketService.socket.emit('leaveRankedGame', this.infoClientService.player);
        }
        this.socketService.socket.emit('leaveGame');
        this.socketService.count = 1;
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
            alert('Coordonnées invalides. Le format doit être (ligne-colonne). Exemple: e10');
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].letter.value !== '') {
            alert("Cette case n'est pas vide. Veuillez choisir une autre case.");
            return;
        }
        if (this.infoClientService.game.board[idxLine][idxColumn].bonus !== 'xx') {
            alert('Cette case possède déjà un bonus. Veuillez choisir une autre case.');
            return;
        }
        this.socketService.socket.emit('powerCardClick', Constants.TRANFORM_EMPTY_TILE, idxLine.toString() + '-' + idxColumn.toString());
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayTransformTileModal = 'none';
    }
}
