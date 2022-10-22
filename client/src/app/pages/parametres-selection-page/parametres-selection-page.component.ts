import { Component, OnInit } from '@angular/core';
import { MockDict } from '@app/classes/mock-dict';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

interface TimeIntervals {
    value: number;
    viewValue: string;
}

@Component({
    selector: 'app-solo-init-page',
    templateUrl: './parametres-selection-page.component.html',
    styleUrls: ['./parametres-selection-page.component.scss'],
})
export class ParametresSelectionPageComponent implements OnInit {
    timeIntervals: TimeIntervals[];
    vpLevels: string[];
    mockDictionary: MockDict;
    isChecked: false;
    displayPowerModal: string;
    //we use a tmp array bc the one of the game get reseted in
    //initializeService() function
    activatedPowers: boolean[];
    constructor(
        private socketService: SocketService, 
        public infoClientService: InfoClientService
    ) {
        this.activatedPowers = this.infoClientService.game.powerCards.map(powerCard => powerCard.isActivated);
        console.log(this.infoClientService.gameMode);
    }

    ngOnInit() {
        this.timeIntervals = [
            { value: 0.5, viewValue: '30 sec' },
            { value: 1, viewValue: '1 min' },
            { value: 1.5, viewValue: '1min 30sec' },
            { value: 2, viewValue: '2 min' },
            { value: 2.5, viewValue: '2min 30sec' },
            { value: 3, viewValue: '3 min' },
            { value: 3.5, viewValue: '3min 30sec' },
            { value: 4, viewValue: '4 min' },
            { value: 4.5, viewValue: '4min 30sec' },
            { value: 5, viewValue: '5 min' },
        ];
        this.vpLevels = ['debutant', 'expert'];
        this.mockDictionary = {
            title: 'Dictionnaire français par défaut',
            description: 'Ce dictionnaire contient environ trente mille mots français',
        };
    }

    onClickTime(interval: string) {
        this.timeSelection(interval);
    }

    onClickDict(dictionary: MockDict) {
        this.mockDictionary = dictionary;
    }

    vpLevelSelection(level: string) {
        this.infoClientService.vpLevel = level;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onTypeGameChange(event: any) {
        switch (event.target.value) {
            case 'public':
                this.infoClientService.isGamePrivate = false;
                break;
            case 'private':
                this.infoClientService.isGamePrivate = true;
                break;
            default:
                break;
        }
    }

    createRoom() {
        // useful to reset the ui
        this.infoClientService.initializeService();
        const passwd = document.getElementById('passwdInput') as HTMLInputElement;
        const inputElement = document.getElementById('roomName') as HTMLInputElement;
        let roomName = inputElement.value;
        this.socketService.socket.emit('createRoomAndGame', {
            roomName,
            playerName: this.infoClientService.playerName,
            timeTurn: this.infoClientService.minutesByTurn,
            isBonusRandom: this.infoClientService.randomBonusesOn,
            gameMode: this.infoClientService.gameMode,
            vpLevel: this.infoClientService.vpLevel,
            isGamePrivate: this.infoClientService.isGamePrivate,
            passwd: passwd.value,
            activatedPowers: this.activatedPowers,
        });
        this.socketService.socket.emit('dictionarySelected', this.mockDictionary);
        this.mockDictionary = {
            title: 'Dictionnaire français par défaut',
            description: 'Ce dictionnaire contient environ trente mille mots français',
        };
        this.infoClientService.dictionaries[0] = this.mockDictionary;
    }
    
    showPowerModal(){
        this.displayPowerModal = 'block';
    }

    hidePowerModal(){
        this.displayPowerModal = 'none';
    }

    onPowerCardClick(powerCardName: string){
        for(let i = 0; i < this.infoClientService.game.powerCards.length; i++){
            if(this.infoClientService.game.powerCards[i].name === powerCardName){
                this.activatedPowers[i] = !this.activatedPowers[i];
                return;
            }
        }
    }

    private timeSelection(interval: string) {
        switch (interval) {
            case '30 sec':
                this.infoClientService.minutesByTurn = 0.5;
                break;
            case '1 min':
                this.infoClientService.minutesByTurn = 1;
                break;
            case '1min 30sec':
                this.infoClientService.minutesByTurn = 1.5;
                break;
            case '2 min':
                this.infoClientService.minutesByTurn = 2;
                break;
            case '2min 30sec':
                this.infoClientService.minutesByTurn = 2.5;
                break;
            case '3 min':
                this.infoClientService.minutesByTurn = 3;
                break;
            case '3min 30sec':
                this.infoClientService.minutesByTurn = 3.5;
                break;
            case '4 min':
                this.infoClientService.minutesByTurn = 4;
                break;
            case '4min 30sec':
                this.infoClientService.minutesByTurn = 4.5;
                break;
            case '5 min':
                this.infoClientService.minutesByTurn = 5;
                break;
        }
    }
}
