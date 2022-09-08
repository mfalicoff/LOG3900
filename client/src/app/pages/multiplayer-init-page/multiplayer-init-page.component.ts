import { AfterViewInit, Component } from '@angular/core';
import { RoomData } from '@app/classes/room-data';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';

@Component({
    selector: 'app-multiplayer-init-page',
    templateUrl: './multiplayer-init-page.component.html',
    styleUrls: ['./multiplayer-init-page.component.scss'],
})
export class MultiplayerInitPageComponent implements AfterViewInit {
    constructor(
        private socketService: SocketService, 
        public infoClientService: InfoClientService) {}
    displayStyleModal: string;

    ngAfterViewInit() {
        this.socketService.socket.emit('listRoom');
    }

    onClickGame(roomName: string) {
        this.socketService.socket.emit('joinRoom', {
            roomName,
            playerId: this.socketService.socket.id,
        });
    }

    //shows the list of players in the room
    onClickMoreInfo(roomName: string){
        this.displayStyleModal = "block";
        let listPlayer = document.getElementById("listPlayer");
        let listVP = document.getElementById("listVP");
        listPlayer!.innerHTML = "";
        listVP!.innerHTML = "";

        const idxExistingRoom = this.infoClientService.rooms.findIndex((room) => room.name === roomName);
        const nbPlayer = this.infoClientService.rooms[idxExistingRoom].players.length;
        
        if(nbPlayer <= 0){
            let titleList = document.createElement("li");
            titleList.innerHTML = "Il n'y a pas de joueur dans cette salle.";
            titleList.style.fontWeight = "bold";
            listPlayer?.appendChild(titleList);
            return;
        }

        let nbRealPlayer = 0;
        let nbVirtualPlayer = 0;
        this.infoClientService.rooms[idxExistingRoom].players.forEach(player => {
            if(player.idPlayer === "virtualPlayer"){
                nbVirtualPlayer++;
            }else{
                nbRealPlayer++;
            }
        });

        if(nbRealPlayer > 0){
            let titleList = document.createElement("li");
            titleList.innerHTML = "Liste des joueurs reels :";
            titleList.style.fontWeight = "bold";
            listPlayer?.appendChild(titleList);
        }
        if(nbVirtualPlayer > 0){
            let titleList = document.createElement("li");
            titleList.innerHTML = "Liste des joueurs virtuels :";
            titleList.style.fontWeight = "bold";
            listVP?.appendChild(titleList);
        }
        this.infoClientService.rooms[idxExistingRoom].players.forEach(player => {
            let li = document.createElement("li");
            li.classList.add("elementList");
            li.appendChild(document.createTextNode(player.name));
            if(player.idPlayer === "virtualPlayer"){
                listVP?.appendChild(li);
            }else{
                listPlayer?.appendChild(li);
            }
        });
    }

    closeListPlayerModal(){
        console.log("yo");
        this.displayStyleModal = "none";
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
}
