import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { RankedUser } from '../classes/ranked-user';
import { User } from '../classes/users.interface';

@Service()
export class MatchmakingService {
    sio: io.Server;
    constructor(){
        this.sio = new io.Server();
        this.rooms = new Map<string, RankedUser[]>();
    }
    rooms: Map<string, RankedUser[]>; // key:first player name value:Game

    initSioMatchmaking(sio: io.Server) {
        this.sio = sio;
    }

    findARoomForPlayer(socket:io.Socket, eloDisparity:number, user:User) {
        for(const value of this.rooms.values()){
            if(this.doesPlayerFitInARoom(value, eloDisparity, user.elo)) {
                this.joinRoom(socket, value, user, eloDisparity);
                if(value.length === 4) {
                    this.launchRankedGame(socket);
                }
                return;
            }
        }
        this.createRoom(socket, user, eloDisparity);
    }

    doesPlayerFitInARoom(value:RankedUser[], eloDisparity: number, playerElo:number): boolean{
        for(const rankedUser of value) {
            let eloDiff:number = Math.abs(playerElo - rankedUser.elo)
            if(eloDiff > rankedUser.eloDisparity || eloDiff > eloDisparity) {
                return false;
            }
        }
        return true;
    }

    joinRoom(socket:io.Socket, room: RankedUser[], user: User, eloDisparity:number){
        socket.join(room[0].name);
        let rankedUser = new RankedUser(user,eloDisparity)
        this.rooms.get(room[0].name)?.push(rankedUser);
        console.log(this.rooms);
    }

    createRoom(socket:io.Socket, user:User, eloDisparity:number){
        let rankedUser = new RankedUser(user,eloDisparity)
        let users:RankedUser[] = [rankedUser];
        this.rooms.set(user.name, users);
        socket.join(user.name);
        this.launchRankedGame(socket);
        //console.log(this.rooms);
        //console.log(socket);
    }

    launchRankedGame(socket:io.Socket){
        console.log(this.sio);
        this.sio.sockets.sockets.get(socket.id)?.emit('matchFound');
    }
    onRefuse(player:Player) {
        this.rooms.delete(player.name);
    }
    onAccept(player:Player) {
        if(this.rooms.has(player.name)) {   
        }
    }
}