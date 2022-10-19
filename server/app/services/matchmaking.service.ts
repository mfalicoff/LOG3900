import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';

@Service()
export class MatchmakingService {
    sio: io.Server;
    constructor(){
        this.sio = new io.Server();
        this.rooms = new Map<string, GameServer>();
    }
    rooms: Map<string, GameServer>; // key:first player name value:Game

    initSioMatchmaking(sio: io.Server) {
        this.sio = sio;
    }

    findARoomForPlayer(player:Player) {
        for(const value of this.rooms.values()){
            if(this.doesPlayerFitInARoom(value, player)) {
                this.joinRoom(player, value);
                if(value.mapPlayers.size === 4) {
                    this.launchRankedGame(value);
                }
                return;
            }
        }
        this.createRoom(player);
    }

    doesPlayerFitInARoom(value:GameServer, player:Player): boolean{
        for(const playerMap of value.mapPlayers.values()) {
            if(Math.floor(playerMap.elo - player.elo) > player.eloDisparity ||
            Math.floor(playerMap.elo - player.elo) > playerMap.eloDisparity) {
                return false;
            }
        }
        return true;
    }

    joinRoom(player:Player, room: GameServer){
        room.mapPlayers.set(player.name,player);
    }

    createRoom(player:Player){
        const gameServer = new GameServer(60, false, 'Ranked', '', player.name, false, '');
        this.rooms.set(player.name,gameServer);
        this.joinRoom(player, gameServer);
        this.launchRankedGame(gameServer);
    }

    launchRankedGame(game: GameServer){
        for(const player of game.mapPlayers.values())
        {
            this.sio.sockets.sockets.get(player.idPlayer)?.emit('matchFound', player);
        }
    }
    onRefuse(player:Player) {
        this.rooms.delete(player.name);
    }
    onAccept(player:Player) {
        if(this.rooms.has(player.name)) {
            
        }
    }
}