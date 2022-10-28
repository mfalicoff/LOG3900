// import { Player } from '@app/classes/player';
// import * as io from 'socket.io';
// import { Service } from 'typedi';

// @Service()
// export class EloChangeService {
//     sio: io.Server;
//     constructor() {
//         this.sio = new io.Server();
//     }
//     /**
//      * Changes the elo of the players given based on their elo and position
//      * @param players players ordered in descending score
//      * @returns the players with their new elo
//      */
//     changeEloOfPlayers(players:Player[]):Player[] {
//         const averageElo = this.calculateAverageElo(players);
//         for (let i =0; i<players.length/2; i++) {
//             players[i].elo += Math.round((2-(i))*10 + ((averageElo - players[i].elo)/20));
//         }
//         for (let i = 2; i<players.length; i++) {
//             players[i].elo += Math.round((1-(i))*10 + ((averageElo - players[i].elo)/20));
//         }
//         return players;
//     }
//     calculateAverageElo(players:Player[]):number {
//         let averageElo:number = 0;
//         for(const player of players) {
//             averageElo += player.elo;
//         }
//         return averageElo/players.length;
//     }
// }