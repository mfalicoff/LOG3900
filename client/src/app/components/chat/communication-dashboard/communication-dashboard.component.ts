import { AfterViewInit, Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { InfoClientService } from '@app/services/info-client.service';
import { NewChatroomModalComponent } from './new-chatroom-modal/new-chatroom-modal.component';
import { trigger, style, animate, transition } from '@angular/animations';
import { ChatRoom } from '@app/classes/chatroom.interface';
import { ChatMessage } from '@app/classes/chat-message';
import { SocketService } from '@app/services/socket.service';
import { JoinChatRoomModalComponent } from './join-chatroom-modal.component.ts/join-chatroom-modal.component';
import * as Constants from '@app/classes/global-constants';

@Component({
    selector: 'app-communication-dashboard',
    templateUrl: './communication-dashboard.component.html',
    styleUrls: ['./communication-dashboard.component.scss'],
    animations: [
        trigger('inOutAnimation', [
            transition(':enter', [style({ height: 0, opacity: 0 }), animate('1s ease-out', style({ height: 300, opacity: 1 }))]),
            transition(':leave', [style({ height: 300, opacity: 1 }), animate('1s ease-in', style({ height: 0, opacity: 0 }))]),
        ]),
    ],
})
export class CommunicationDashboardComponent implements AfterViewInit {
    @Input() isInGame: string;
    currSelectedChatroom: ChatRoom;
    constructor(private socketService: SocketService, public infoClientService: InfoClientService, private dialog: MatDialog) {
        this.currSelectedChatroom = { name: 'default', participants: [], creator: '', chatHistory: [new ChatMessage('system', 'defaultMsg')] };
        // initialize the default selected chatroom
        if (this.infoClientService.chatRooms.length > 0) {
            this.currSelectedChatroom = this.infoClientService.chatRooms[0];
        }
    }

    ngAfterViewInit(): void {
        if (this.isInGame === 'true') {
            this.infoClientService.chatRooms.unshift({
                name: 'game',
                participants: [],
                creator: '',
                chatHistory: [new ChatMessage('SYSTEM', 'Bienvenue sur le channel de discussion de la partie.')],
            });
            this.currSelectedChatroom = this.infoClientService.chatRooms[0];
        } else {
            // if the user is not in a game there is no game chat
            const idxGameRoom = this.infoClientService.chatRooms.findIndex((chatRoom) => chatRoom.name === 'game');
            if (idxGameRoom !== Constants.DEFAULT_VALUE_NUMBER) {
                this.infoClientService.chatRooms.splice(idxGameRoom, 1);
                this.currSelectedChatroom = this.infoClientService.chatRooms[0];
            }
        }
    }

    onChatRoomSelect(selectedChatRoom: ChatRoom) {
        if (!selectedChatRoom) {
            return;
        }
        this.currSelectedChatroom = selectedChatRoom;
    }

    onLeaveChatRoomClick(chatRoomName: string) {
        const idxChatRoom = this.infoClientService.chatRooms.findIndex((chatRoom) => chatRoom.name === chatRoomName);
        if (idxChatRoom === Constants.DEFAULT_VALUE_NUMBER) {
            return;
        }
        this.socketService.socket.emit('leaveChatRoom', chatRoomName);
        this.infoClientService.chatRooms.splice(idxChatRoom, 1);
    }

    classChatRoomElement(chatRoomName: string): string {
        if (this.currSelectedChatroom.name === chatRoomName) {
            return 'chatRoomElementPressed';
        }
        return '';
    }

    openNewChatroomModal(): void {
        const dialogRef = this.dialog.open(NewChatroomModalComponent, {
            height: '20%',
            width: '25%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.afterClosed().subscribe(() => {
            /* does nothing for now*/
        });
    }

    openJoinChatRoomModal(): void {
        const dialogRef = this.dialog.open(JoinChatRoomModalComponent, {
            height: '50%',
            width: '25%',
            panelClass: 'matDialogWheat',
        });

        dialogRef.afterClosed().subscribe(() => {
            /* does nothing for now*/
        });
    }
}