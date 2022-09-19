import { Command } from './command';

export class Spectator {
    socketId: string;
    name: string;
    chatHistory: Command[];

    constructor(nameSpectator: string) {
        this.name = nameSpectator;
        this.socketId = '';
        this.chatHistory = [];
    }
}
