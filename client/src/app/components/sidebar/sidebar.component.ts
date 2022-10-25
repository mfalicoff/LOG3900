/* eslint-disable deprecation/deprecation */
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import * as Constants from '@app/classes/global-constants'

@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
    displayPowerModal: string;
    displayExchStandModal: string;
    letterFromReserveChoosed: string;
    idxTileFromStandChoosed: number;
    constructor(
        private socketService: SocketService, 
        public infoClientService: InfoClientService, 
        private router: Router
    ) {
        console.log(infoClientService.player.powerCards)
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
        this.socketService.socket.emit('leaveGame');
    }

    startGame() {
        this.socketService.socket.emit('startGame', this.infoClientService.game.roomName);
        this.infoClientService.creatorShouldBeAbleToStartGame = false;
    }

    shouldSpecBeAbleToBePlayer() {
        if (this.infoClientService.game.gameFinished || !this.infoClientService.isSpectator) {
            return false;
        }
        const nbVirtualPlayer = Array.from(this.infoClientService.actualRoom.players).filter((player) => player.idPlayer === 'virtualPlayer').length;
        if (nbVirtualPlayer > 0) {
            return true;
        } else {
            return false;
        }
    }

    spectWantsToBePlayer() {
        this.socketService.socket.emit('spectWantsToBePlayer');
    }

    showPowerList(){
        this.displayPowerModal = 'block';
    }

    hidePowerModal(){
        this.displayPowerModal = 'none';
    }

    onPowerCardClick(powerCardName: string){
        this.socketService.socket.emit("requestLetterReserve");
        console.log("powerCardName", powerCardName);
        if(powerCardName === Constants.EXCHANGE_LETTER_JOKER){
            console.log("YESSSSSSSSSss")
        }
        switch(powerCardName){
            case Constants.TRANFORM_EMPTY_TILE:{
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER:{
                this.infoClientService.displayExchLetterModal = 'block';
                break;
            }
            case Constants.EXCHANGE_STAND:{
                console.log("yooo1");
                this.displayExchStandModal = 'block';
                break;
            }
            default:{
                console.log("fail");
                this.infoClientService.powerUsedForTurn = true;
                this.socketService.socket.emit('powerCardClick', powerCardName, '');
                break;
            }
        }
        this.hidePowerModal();
    }

    onExchangeStandChoice(playerName: string){
        this.infoClientService.powerUsedForTurn = true;
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_STAND, playerName);
        this.displayExchStandModal = 'none';
    }
    onChooseLetterToExchange(id: number){
        this.idxTileFromStandChoosed = id;
        let letterElement = document.getElementById(id.toString())!;
        letterElement.style.backgroundColor = "#0C483F";
        letterElement.style.color = "wheat";
        for(let i = 0; i < this.infoClientService.player.stand.length; i++){
            if(i === id){
                continue;
            }
            let otherLetterElement = document.getElementById(i.toString())!;
            otherLetterElement.style.backgroundColor = "wheat";
            otherLetterElement.style.color = "#0C483F";
        }
    }
    onChooseLetterToTakeFromReserve(id: number, choosedLetter: string){
        this.letterFromReserveChoosed = choosedLetter;
        const addOnForReserve = 7;
        let letterElement = document.getElementById((id + addOnForReserve).toString())!;
        letterElement.style.backgroundColor = "#0C483F";
        letterElement.style.color = "wheat";
        for(let i = 0; i < this.infoClientService.letterReserve.length; i++){
            if(i === id){
                continue;
            }
            let otherLetterElement = document.getElementById((i + addOnForReserve).toString())!;
            otherLetterElement.style.backgroundColor = "wheat";
            otherLetterElement.style.color = "#0C483F";
        }
    }

    activateLetterExchange(){
        const additionalParams = this.letterFromReserveChoosed + this.idxTileFromStandChoosed.toString();
        this.socketService.socket.emit('powerCardClick', Constants.EXCHANGE_LETTER_JOKER, additionalParams);
        this.infoClientService.powerUsedForTurn = true;
        this.infoClientService.displayExchLetterModal = 'none';
    }
}
