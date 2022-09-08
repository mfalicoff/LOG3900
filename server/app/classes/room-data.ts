export class RoomData {
    name: string;
    timeTurn: string;
    isBonusRandom: boolean;
    isLog2990Enabled: boolean;
    nbPlayers: number;
    nbSpectators: number;

    constructor(name: string, timeTurn: string, 
                isBonusRandom: boolean, isLog2990Enabled: boolean,
                nbPlayers: number, nbSpectators: number) {
        this.name = name;
        this.timeTurn = timeTurn;
        this.isBonusRandom = isBonusRandom;
        this.isLog2990Enabled = isLog2990Enabled;
        this.nbPlayers = nbPlayers;
        this.nbSpectators = nbSpectators;
    }
}
