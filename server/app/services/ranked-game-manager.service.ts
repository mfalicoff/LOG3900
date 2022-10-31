// import { GameServer } from '@app/classes/game-server';
// import { Player } from '@app/classes/player';
// import * as io from 'socket.io';
// import { Service } from 'typedi';
// import { BoardService } from './board.service';

// @Service()
// export class EndGameService {
//     sio: io.Server;
//     rooms: Map<string, GameServer>;
//     constructor(public boardService:BoardService) {
//         this.sio = new io.Server();
//         this.rooms = new Map<string, GameServer>();
//     }
//     private createGameAndPlayer(
//         gameMode: string,
//         timeTurn: number,
//         isBonusRandom: boolean,
//         playerName: string,
//         socket: io.Socket,
//         roomName: string,
//         vpLevel: string,
//         isGamePrivate: boolean,
//         passwd: string,
//     ) {
//         // We create the game and add it to the rooms map
//         const newGame: GameServer = new GameServer(timeTurn, isBonusRandom, gameMode, vpLevel, roomName, isGamePrivate, passwd);
//         const newPlayer = new Player(playerName, true);
//         newPlayer.idPlayer = socket.id;
//         this.boardService.initBoardArray(newGame);

//         // // fill the remaining players with bots
//         // for (let i = 0; i < GlobalConstants.MAX_PERSON_PLAYING - 1; i++) {
//         //     const virtualPlayerId = 'virtualPlayer';
//         //     const newOpponent = new Player(this.databaseService.namesVP[i].firstName + ' ' + this.databaseService.namesVP[i].lastName, false);

//         //     newOpponent.idPlayer = virtualPlayerId;
//         //     newGame.mapPlayers.set(newOpponent.name, newOpponent);
//         // }

//         newGame.mapPlayers.set(newPlayer.name, newPlayer);
//         this.rooms.set(roomName, newGame);

//         // Joining the room
//         socket.join(roomName);
//             this.shouldCreatorBeAbleToStartGame(newGame);
//     }
// }
