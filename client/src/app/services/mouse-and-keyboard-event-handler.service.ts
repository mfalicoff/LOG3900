import { Injectable } from '@angular/core';
import { Vec2 } from '@app/classes/vec2';
import { PlaceGraphicService } from '@app/services/place-graphic.service';
import { SocketService } from '@app/services/socket.service';
import { DrawingBoardService } from './drawing-board-service';
import { InfoClientService } from './info-client.service';
import { ChatMessage } from '@app/classes/chat-message.interface';

@Injectable({
    providedIn: 'root',
})
export class MouseKeyboardEventHandlerService {
    isCommunicationBoxFocus: boolean;
    private isStandClicked: boolean;
    private isCommBoxJustBeenClicked: boolean;

    constructor(
        private drawingBoardService: DrawingBoardService,
        private socketService: SocketService,
        private placeGraphicService: PlaceGraphicService,
        private infoClientService: InfoClientService,
    ) {
        this.isCommunicationBoxFocus = false;
        this.isStandClicked = false;
        this.isCommBoxJustBeenClicked = false;
    }

    onLeftClickStand(event: MouseEvent) {
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isStandClicked = true;
        this.isCommBoxJustBeenClicked = false;

        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('leftClickSelection', coordinateXClick);
    }

    onRightClickStand(event: MouseEvent) {
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordinateXClick: number = event.offsetX;
        if (this.drawingBoardService.lettersDrawn) {
            return;
        }
        this.socketService.socket.emit('rightClickExchange', coordinateXClick);
    }

    onBoardClick(event: MouseEvent) {
        this.isCommBoxJustBeenClicked = false;
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        event.preventDefault();
        const coordsClick: Vec2 = { x: event.offsetX, y: event.offsetY };

        if (this.infoClientService.isTurnOurs) {
            if (this.drawingBoardService.lettersDrawn) {
                return;
            }
            this.drawingBoardService.findTileToPlaceArrow(coordsClick, this.infoClientService.game.board, this.infoClientService.game.bonusBoard);
        }
    }

    onCommunicationBoxEnter(input: string) {
        this.socketService.socket.emit('newMessageClient', input);
        this.isCommBoxJustBeenClicked = false;
        this.isCommunicationBoxFocus = true;
    }

    onCommunicationBoxEnterChat(chat: ChatMessage) {
        if (this.socketService.socket.connected) {
            this.socketService.socket.emit('chat msg', chat);
            this.isCommBoxJustBeenClicked = false;
            this.isCommunicationBoxFocus = true;
        } else {
            throw new Error('not connected to server');
        }
    }

    handleKeyboardEvent(event: KeyboardEvent) {
        // TODO uncomment this when everything works
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }
        if (this.drawingBoardService.isArrowPlaced) {
            this.placeGraphicService.manageKeyboardEvent(this.infoClientService.game, this.infoClientService.player, event.key);
            return;
        }
        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardSelection', eventString);
    }

    handleArrowEvent(event: KeyboardEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.key.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    handleScrollEvent(event: WheelEvent) {
        if (this.isCommunicationBoxFocus || !this.infoClientService.game?.gameStarted) {
            return;
        }

        const eventString: string = event.deltaY.toString();
        this.socketService.socket.emit('keyboardAndMouseManipulation', eventString);
    }

    onLeftClickGamePage() {
        if (!this.isCommBoxJustBeenClicked) {
            this.isCommunicationBoxFocus = false;
        }
        if (!this.infoClientService.game?.gameStarted) {
            return;
        }
        this.isCommBoxJustBeenClicked = false;
        if (!this.isStandClicked) {
            if (this.drawingBoardService.lettersDrawn !== '') {
                return;
            }
            this.socketService.socket.emit('resetAllTilesStand');
        } else {
            this.isStandClicked = !this.isStandClicked;
        }
        this.isCommBoxJustBeenClicked = false;
    }

    onCommunicationBoxLeftClick() {
        this.isCommBoxJustBeenClicked = true;
        this.isCommunicationBoxFocus = true;
    }
}
