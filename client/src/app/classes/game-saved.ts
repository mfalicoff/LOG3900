import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';

export class GameSaved {
    roomName: string;
    players: Player[];
    spectators?: Spectator[];
    winners?: Player[];
    numberOfTurns: number;
    gameStartDate: string;
    playingTime: string;
    nbLetterReserve: number;
    mapLettersOnStand: Map<string, string>;
    _id?: string;

    constructor(
        players: Player[],
        roomName: string,
        numberOfTurns: number,
        gameStartDate: string,
        playingTime: string,
        nbLetterReserve: number,
        spectators?: Spectator[],
        winners?: Player[],
    ) {
        this.roomName = roomName;
        this.players = players;
        this.spectators = spectators;
        this.winners = winners;
        this.numberOfTurns = numberOfTurns;
        this.playingTime = playingTime;
        this.nbLetterReserve = nbLetterReserve;
        this.gameStartDate = gameStartDate;
        this.mapLettersOnStand = new Map<string, string>();

        this.populateMap(this.players);
    }

    populateMap(players: Player[]) {
        for (const player of players) {
            this.mapLettersOnStand.set(player.name, this.lettersOnStand(player));
        }
    }

    lettersOnStand(player: Player): string {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand.toString();
    }
}
