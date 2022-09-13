import { Player } from './player';
import { Spectator } from './spectator';

export class RoomData {
    name: string;
    timeTurn: string;
    isBonusRandom: boolean;
    isLog2990Enabled: boolean;
    players: Player[];
    spectators: Spectator[];

    constructor(name: string, timeTurn: string, isBonusRandom: boolean, isLog2990Enabled: boolean, players: Player[], spectators: Spectator[]) {
        this.name = name;
        this.timeTurn = timeTurn;
        this.isBonusRandom = isBonusRandom;
        this.isLog2990Enabled = isLog2990Enabled;
        this.players = players;
        this.spectators = spectators;
    }
}
