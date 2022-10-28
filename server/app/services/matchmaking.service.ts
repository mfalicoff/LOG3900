import * as io from 'socket.io';
import { Service } from 'typedi';
import { RankedGame } from '../classes/ranked-game';
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
                if(value.length === 2) {
                    this.rankedMatchFound(socket, value);
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

    joinRoom(socket:io.Socket, users: RankedUser[], user: User, eloDisparity:number){
        socket.join(users[0].name);
        let rankedUser = new RankedUser(user,eloDisparity)
        this.rooms.get(users[0].name)?.push(rankedUser);
    }

    createRoom(socket:io.Socket, user:User, eloDisparity:number){
        let rankedUser = new RankedUser(user,eloDisparity)
        let users:RankedUser[] = [rankedUser];
        this.rooms.set(user.name, users);
        socket.join(user.name);
        // this.rankedMatchFound(users);
    }

    rankedMatchFound(socket:io.Socket, users: RankedUser[]){
        this.sio.to(users[0].name).emit('matchFound');
        let rankedGame: RankedGame = new RankedGame( users[0].name, 0.30, users);
        this.checkForUsersAccept(rankedGame);
    }
    onRefuse(socket:io.Socket, user:User) {
        for(const users of this.rooms.values()) {
            for(const rankedUser of users) {
                if(rankedUser.name === user.name) {
                    rankedUser.hasAccepted = false;
                    this.sio.sockets.sockets.get(socket.id)?.emit('closeModalOnRefuse');
                    socket.leave(users[0].name);
                }
            }
        }
    }
    onAccept(socket:io.Socket, user:User) {
        for(const users of this.rooms.values()) {
            for(const rankedUser of users) {
                if(rankedUser.name === user.name) {
                    rankedUser.hasAccepted = true;
                    rankedUser.socketId = socket.id;
                }
            }
        }
    }
    checkForUsersAccept(rankedGame:RankedGame) {
        const timerInterval = setInterval(() => {
            if (rankedGame.secondsValue <= 2) {
                clearInterval(timerInterval);
                const rankedUsers:RankedUser[] = this.rooms.get(rankedGame.name) as RankedUser[];
                for(const user of rankedUsers) {
                    if(user.hasAccepted === false)
                    {
                        this.matchRefused(rankedGame);
                        this.rooms.delete(rankedGame.name);
                        return;
                    }
                }
                this.createRankedGame(rankedGame);
                this.rooms.delete(rankedGame.name);
            }
        }, 1000);
    }

    async createRankedGame(rankedGame:RankedGame) {
        let creatorUser:RankedUser = rankedGame.rankedUsers[0];
        for(const user of rankedGame.rankedUsers) {
            if(user.name === rankedGame.name) {
                creatorUser= user;
                await this.sio.sockets.sockets.get(user.socketId)?.emit('createRankedGame', user.name);
            }
        }
        const timerInterval = setInterval(() => {
        if (rankedGame.secondsValue <= 1) {
            for(const user of rankedGame.rankedUsers) {
                if(user.name !== rankedGame.name) {
                    this.sio.sockets.sockets.get(user.socketId)?.emit('joinRoom', rankedGame.name, user.socketId);
                }
            }
        }
        if(rankedGame.secondsValue <= 0) {
            clearInterval(timerInterval);
            this.sio.sockets.sockets.get(creatorUser.socketId)?.emit('startGame', creatorUser.name);
        }
    },1000)
    }

    matchRefused(rankedGame:RankedGame) { 
        for(let i =0; i< rankedGame.rankedUsers.length;i++) {
            if(rankedGame.rankedUsers[i].hasAccepted === false) {
                rankedGame.rankedUsers.splice(i,1);
            }
        }
        this.sio.to(rankedGame.name).emit('closeModal');
    }
}