import { Injectable } from '@angular/core';
import { Player } from '@app/classes/player';
import { SocketService } from './socket.service';

@Injectable({
    providedIn: 'root',
})
export class EloChangeService {

    constructor(public socketService: SocketService){}
    
    changeEloOfPlayers(oldPlayers:Player[]):Player[] {
        let newPlayers:Player[] = [];
        oldPlayers.forEach(val => newPlayers.push(Object.assign({}, val)));
        const averageElo = this.calculateAverageElo(oldPlayers);
        console.log(averageElo);
        newPlayers[0].elo += Math.round(20 + ((averageElo - oldPlayers[0].elo)/20));
        newPlayers[1].elo += Math.round(10 + ((averageElo - oldPlayers[1].elo)/20));
        newPlayers[2].elo -= Math.round(10 + ((averageElo - oldPlayers[2].elo)/20));
        newPlayers[3].elo -= Math.round(20 + ((averageElo - oldPlayers[3].elo)/20));
        console.log(newPlayers);
        return newPlayers;
    }
    private calculateAverageElo(players:Player[]):number {
        let averageElo:number = 0;
        for(const player of players) {
            averageElo += player.elo;
        }
        return averageElo/players.length;
    }

}