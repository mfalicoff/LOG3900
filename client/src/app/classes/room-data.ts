import { Player } from './player';
import { Spectator } from './spectator';

export class RoomData {
    name: string;
    timeTurn: string;
    passwd: string;
    players: Player[];
    spectators: Spectator[];

    constructor(name: string, timeTurn: string, passwd: string, players: Player[], spectators: Spectator[]) {
        this.name = name;
        this.timeTurn = timeTurn;
        this.passwd = passwd;
        this.players = players;
        this.spectators = spectators;
    }
}
