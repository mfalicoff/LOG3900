/* eslint-disable @typescript-eslint/no-non-null-assertion*/
import { AfterViewInit, Component } from '@angular/core';
import { RoomData } from '@app/classes/room-data';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import * as Constants from '@app/classes/global-constants';

@Component({
    selector: 'app-multiplayer-init-page',
    templateUrl: './multiplayer-init-page.component.html',
    styleUrls: ['./multiplayer-init-page.component.scss'],
})
export class MultiplayerInitPageComponent implements AfterViewInit {
    displayStyleModal: string;
    passwdModalStyle: string;
    passwordText: string;
    actualPassword: string;
    roomNameClicked: string;
    constructor(private socketService: SocketService, public infoClientService: InfoClientService) {}

    ngAfterViewInit() {
        this.socketService.socket.emit('listRoom');
    }

    onClickGame(roomName: string) {
        // useful to reset the ui
        this.infoClientService.initializeService();
        const roomClicked = this.infoClientService.rooms.find((room) => room.name === roomName);
        if (!roomClicked) {
            return;
        }

        this.actualPassword = roomClicked.passwd;
        this.roomNameClicked = roomName;
        if (this.actualPassword !== '') {
            this.passwdModalStyle = 'block';
        } else {
            this.joinRoom(roomName);
        }
    }

    askForPasswd() {
        this.passwdModalStyle = 'none';
        if (this.passwordText !== this.actualPassword) {
            alert('Mot de passe incorrect');
        } else {
            this.joinRoom(this.roomNameClicked);
        }
    }

    // shows the list of players in the room
    onClickMoreInfo(roomName: string) {
        this.displayStyleModal = 'block';
        const listPlayer = document.getElementById('listPlayer');
        const listVP = document.getElementById('listVP');
        const creatorOfGameUi = document.getElementById('creatorOfGame');
        listPlayer!.innerHTML = '';
        listVP!.innerHTML = '';
        creatorOfGameUi!.innerHTML = '';

        const idxExistingRoom = this.infoClientService.rooms.findIndex((room) => room.name === roomName);
        const nbPlayer = this.infoClientService.rooms[idxExistingRoom].players.length;

        if (nbPlayer <= 0) {
            const titleList = document.createElement('li');
            titleList.innerHTML = "Il n'y a pas de joueur dans cette salle.";
            titleList.style.fontWeight = 'bold';
            listPlayer?.appendChild(titleList);
            return;
        }

        let nbRealPlayer = 0;
        let nbVirtualPlayer = 0;
        this.infoClientService.rooms[idxExistingRoom].players.forEach((player) => {
            if (player.id === 'virtualPlayer') {
                nbVirtualPlayer++;
            } else {
                nbRealPlayer++;
            }
        });

        const creatorOfGame = this.infoClientService.rooms[idxExistingRoom].players.find((player) => player.isCreatorOfGame);
        creatorOfGameUi!.innerHTML = 'Le createur de la partie est : ' + creatorOfGame?.name;
        creatorOfGameUi!.style.fontWeight = 'bold';

        if (nbRealPlayer > 0) {
            const titleList = document.createElement('li');
            titleList.innerHTML = 'Il y a ' + nbRealPlayer + ' joueur(s) reel(s) :';
            titleList.style.fontWeight = 'bold';
            listPlayer?.appendChild(titleList);
        }
        if (nbVirtualPlayer > 0) {
            const titleList = document.createElement('li');
            titleList.innerHTML = 'Il y a ' + nbVirtualPlayer + ' joueur(s) virtuel(s) :';
            titleList.style.fontWeight = 'bold';
            listVP?.appendChild(titleList);
        }
        this.infoClientService.rooms[idxExistingRoom].players.forEach((player) => {
            const li = document.createElement('li');
            li.classList.add('elementList');
            li.appendChild(document.createTextNode(player.name));
            if (player.id === 'virtualPlayer') {
                listVP?.appendChild(li);
            } else {
                listPlayer?.appendChild(li);
            }
        });
    }

    closeListPlayerModal() {
        this.displayStyleModal = 'none';
    }

    onClickRandom() {
        // get une liste de toutes les keys des rooms
        const rooms: RoomData[] = this.infoClientService.rooms;
        if (rooms.length > 0) {
            // get random key
            const roomName: string = rooms[Math.floor(Math.random() * rooms.length)].name;
            // join room
            this.socketService.socket.emit('joinRoom', { roomName, playerId: this.socketService.socket.id });
        } else {
            alert("Il n'y a pas de salle disponible.");
        }
    }

    chooseRooms(): RoomData[] {
        if (this.infoClientService.gameMode === Constants.CLASSIC_MODE) {
            return this.infoClientService.rooms.filter((room) => room.gameMode === Constants.CLASSIC_MODE);
        } else if (this.infoClientService.gameMode === Constants.POWER_CARDS_MODE) {
            return this.infoClientService.rooms.filter((room) => room.gameMode === Constants.POWER_CARDS_MODE);
        } else {
            // eslint-disable-next-line no-console
            console.log('Error in MultiplayerComponent:chooseRooms()');
            return [];
        }
    }

    getReelPlayersLength(room: RoomData): number {
        return room.players.filter((player) => player.id !== 'virtualPlayer').length;
    }

    getVirtualPlayersLength(room: RoomData): number {
        return room.players.filter((player) => player.id === 'virtualPlayer').length;
    }

    private joinRoom(roomName: string) {
        // joins the room
        this.socketService.socket.emit('joinRoom', {
            roomName,
            playerId: this.socketService.socket.id,
        });
    }
}
