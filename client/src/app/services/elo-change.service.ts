import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class EloChangeService {
    baseEloChangeForFirstOrLast = 20;
    baseEloChangeForSecondOrThird = 10;
    eloDisparityFactor = 20;
    constructor(public socketService: SocketService) {}

    changeEloOfPlayers(oldPlayers: Player[]): Player[] {
        const newPlayers: Player[] = [];
        oldPlayers.forEach((val) => newPlayers.push(Object.assign({}, val)));
        const averageElo = this.calculateAverageElo(oldPlayers);
        newPlayers[0].elo += Math.round(this.baseEloChangeForFirstOrLast + (averageElo - oldPlayers[0].elo) / this.eloDisparityFactor);
        newPlayers[1].elo += Math.round(this.baseEloChangeForSecondOrThird + (averageElo - oldPlayers[1].elo) / this.eloDisparityFactor);
        newPlayers[2].elo -= Math.round(this.baseEloChangeForSecondOrThird + (averageElo - oldPlayers[2].elo) / this.eloDisparityFactor);
        newPlayers[3].elo -= Math.round(this.baseEloChangeForFirstOrLast + (averageElo - oldPlayers[3].elo) / this.eloDisparityFactor);
        return newPlayers;
    }
    private calculateAverageElo(players: Player[]): number {
        let averageElo = 0;
        for (const player of players) {
            averageElo += player.elo;
        }
        return averageElo / players.length;
    }
}
