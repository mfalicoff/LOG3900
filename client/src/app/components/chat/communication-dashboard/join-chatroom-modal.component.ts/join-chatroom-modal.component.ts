import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChatRoom } from '@app/classes/chatroom.interface';
import { GalleryComponent } from '@app/components/gallery/gallery.component';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import * as Constants from '@app/classes/global-constants';

@Component({
    selector: 'app-join-chatroom-modal',
    templateUrl: './join-chatroom-modal.component.html',
    styleUrls: ['./join-chatroom-modal.component.scss'],
})
export class JoinChatRoomModalComponent {
    @ViewChild(GalleryComponent) galleryComponent: GalleryComponent;

    roomsFound: ChatRoom[] = [];
    roomName = '';

    constructor(private dialog: MatDialog, private socketService: SocketService, private infoClientService: InfoClientService) {
        socketService.socket.on('getChatRoomsNames', (roomsFound) => {
            this.roomsFound = roomsFound;
            // removing the rooms where the client is already in them
            for (const chatRoom of this.infoClientService.chatRooms) {
                const idxRoom = this.roomsFound.findIndex((room) => room.name === chatRoom.name);
                if (idxRoom !== Constants.DEFAULT_VALUE_NUMBER) {
                    this.roomsFound.splice(idxRoom, 1);
                }
            }
        });
    }

    onChangeInput() {
        this.socketService.socket.emit('getChatRoomsNames', this.roomName);
    }

    closeDialog() {
        this.dialog.closeAll();
    }

    joinChatRoom(chatRoomName: string) {
        this.socketService.socket.emit('joinChatRoom', chatRoomName);
        const idxRoom = this.roomsFound.findIndex((room) => room.name === chatRoomName);
        if (idxRoom !== Constants.DEFAULT_VALUE_NUMBER) {
            this.roomsFound.splice(idxRoom, 1);
        }
        alert('Vous avez rejoins la salle: ' + chatRoomName);
    }
}
