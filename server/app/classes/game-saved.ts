/* eslint-disable @typescript-eslint/no-magic-numbers*/
import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';

export class GameSaved {
    players: Player[];
    spectators: Spectator[];
    winners: Player[];
    roomName: string;
    numberOfTurns: number;
    gameStartDate: string;
    playingTime: string;
    nbLetterReserve: number;
    mapLettersOnStand: Map<Player, string>;

    constructor(
        players: Player[],
        spectators: Spectator[],
        winners: Player[],
        roomName: string,
        numberOfTurns: number,
        gameStartDate: string,
        playingTime: string,
        nbLetterReserve: number,
    ) {
        this.players = players;
        this.spectators = spectators;
        this.winners = winners;
        this.roomName = roomName;
        this.numberOfTurns = numberOfTurns;
        this.playingTime = playingTime;
        this.nbLetterReserve = nbLetterReserve;
        this.gameStartDate = gameStartDate;

        this.populateMap(this.players);
    }

    populateMap(players: Player[]) {
        for (const player of players) {
            this.mapLettersOnStand.set(player, this.lettersOnStand(player));
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
