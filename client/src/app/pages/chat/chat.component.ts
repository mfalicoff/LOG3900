import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import {MouseKeyboardEventHandlerService} from "@app/services/mouse-and-keyboard-event-handler.service";
import {InfoClientService} from "@app/services/info-client.service";
import {SocketService} from "@app/services/socket.service";

interface Chat {
    id: string;
    msg: string;
}

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('commands') itemElements: QueryList<Element>;

    inputInComBox: string = '';
    username: string = '';
    chatHistory: Chat[] = [];
    private scrollContainer: Element;

    constructor(
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        public infoClientService: InfoClientService,
        private socketService: SocketService,
    ) {
        this.socketService.socket.on('chat msg', (chat: Chat) => {
            console.log(chat);
            this.chatHistory.push(chat)
        });

    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        // we weren't able to find an equivalent without using using subscribe
        // nothing was working for this specific case
        // eslint-disable-next-line deprecation/deprecation
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    onLeftClickComBox(): void {
        this.mouseKeyboardEventHandler.onCommunicationBoxLeftClick();
    }

    // function that shows the content of the input, the place in the message array
    // and delete the input field
    onEnterComBox(input: string): void {
        (document.getElementById('inputCommBox') as HTMLInputElement).value = '';
        console.log(input);
        const chat: Chat = {
            id: this.username,
            msg: input,
        }

        this.mouseKeyboardEventHandler.onCommunicationBoxEnterChat(chat);
        this.chatHistory.push(chat);
    }

    onEnterUsernameBox(input: string): void {
        this.username = input
    }

    getChatHistory() {
        console.log("here", this.chatHistory);
        return this.chatHistory;
    }

    private scrollToBottom(): void {
        this.scrollContainer.scroll({
            top: this.scrollContainer.scrollHeight,
            left: 0,
            behavior: 'auto',
        });
    }
}
