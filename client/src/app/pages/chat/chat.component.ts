import { AfterViewInit, Component, ElementRef, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { MouseKeyboardEventHandlerService } from '@app/services/mouse-and-keyboard-event-handler.service';
import { InfoClientService } from '@app/services/info-client.service';
import { SocketService } from '@app/services/socket.service';
import { ChatMessage } from '@app/classes/chat-message.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss'],
})
export class ChatComponent implements AfterViewInit {
    @ViewChild('scrollFrame', { static: false }) scrollFrame: ElementRef;
    @ViewChildren('commands') itemElements: QueryList<Element>;

    inputInComBox: string = '';
    // username: string = '';
    chatHistory: ChatMessage[] = [];
    private scrollContainer: Element;

    constructor(
        private mouseKeyboardEventHandler: MouseKeyboardEventHandlerService,
        public infoClientService: InfoClientService,
        private socketService: SocketService,
        private http: HttpClient,
        private router: Router,
    ) {
        this.socketService.socket.on('chat msg', (chat: ChatMessage) => {
            this.chatHistory.push(chat);
        });
    }

    ngAfterViewInit() {
        this.scrollContainer = this.scrollFrame.nativeElement;
        // eslint-disable-next-line deprecation/deprecation
        this.itemElements.changes.subscribe(() => this.scrollToBottom());
    }

    // function that shows the content of the input, the place in the message array
    // and delete the input field
    onEnterComBox(input: string): void {
        (document.getElementById('inputField') as HTMLInputElement).value = '';
        const chat: ChatMessage = {
            sender: this.infoClientService.playerName,
            msg: input,
            timestamp: new Date(),
        };

        try {
            this.mouseKeyboardEventHandler.onCommunicationBoxEnterChat(chat);
            this.chatHistory.push(chat);
        } catch (e) {
            console.log(e);
        }
    }

    async logOut() {
        return this.http.post<unknown>(environment.serverUrl + 'logout', {}, { withCredentials: true }).subscribe({
            next: (data) => {
                // @ts-ignore
                this.infoClientService.playerName = data.data.name;
                this.router.navigate(['/chat']);
            },
            error: (error) => {
                this.handleErrorPOST(error);
            },
        });
    }

    private handleErrorPOST(error: HttpErrorResponse) {
        if (error.error instanceof ErrorEvent) {
            alert('Erreur: ' + error.status + error.error.message);
        } else {
            alert(`Erreur ${error.status}.` + ` Le message d'erreur est le suivant:\n ${error.error}`);
        }
    }

    getChatHistory() {
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
