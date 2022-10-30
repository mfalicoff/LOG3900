import * as io from 'socket.io';
import { Service } from 'typedi';
import { RankedGame } from '../classes/ranked-game';
import { RankedUser } from '../classes/ranked-user';
import { User } from '../classes/users.interface';

@Service()
//players that join are not added to the player map 
export class MatchmakingService {
    sio: io.Server;
    constructor(){
        this.sio = new io.Server();
        this.rooms = new Map<string, RankedGame>();
    }
    rooms: Map<string, RankedGame>; // key:first player name value:Game

    initSioMatchmaking(sio: io.Server) {
        this.sio = sio;
    }

    findARoomForPlayer(socket:io.Socket, eloDisparity:number, user:User) {
        for(const value of this.rooms.values()){
            if(this.doesPlayerFitInARoom(value, eloDisparity, user.elo)) {
                this.joinRoom(socket, value, user, eloDisparity);
                if(value.rankedUsers.length === 4) {
                    this.rankedMatchFound(value);
                }
                return;
            }
        }
        this.createRoom(socket, user, eloDisparity);
    }

    doesPlayerFitInARoom(value:RankedGame, eloDisparity: number, playerElo:number): boolean{
        for(const rankedUser of value.rankedUsers) {
            let eloDiff:number = Math.abs(playerElo - rankedUser.elo)
            if(eloDiff > rankedUser.eloDisparity || eloDiff > eloDisparity || value.rankedUsers.length >=4) {
                return false;
            }
        }
        return true;
    }

    joinRoom(socket:io.Socket, game: RankedGame, user: User, eloDisparity:number){
        socket.join(game.name);
        let rankedUser = new RankedUser(user,eloDisparity)
        this.rooms.get(game.name)?.rankedUsers.push(rankedUser);
    }

    createRoom(socket:io.Socket, user:User, eloDisparity:number){
        let rankedUser = new RankedUser(user,eloDisparity)
        let rankedUsers :RankedUser[] = [rankedUser]
        let users:RankedGame = new RankedGame(user.name,rankedUsers);
        this.rooms.set(user.name, users);
        socket.join(user.name);
    }

    rankedMatchFound(rankedGame: RankedGame){
        this.sio.to(rankedGame.name).emit('matchFound');
        rankedGame.startTimer(0.35);
        this.checkForUsersAccept(rankedGame);
    }
    onRefuse(socket:io.Socket, user:User) {
        for(const users of this.rooms.values()) {
            for(const rankedUser of users.rankedUsers) {
                if(rankedUser.name === user.name) {
                    rankedUser.hasAccepted = false;
                    this.sio.sockets.sockets.get(socket.id)?.emit('closeModalOnRefuse');
                    socket.leave(users.name);
                }
            }
        }
    }
    onAccept(socket:io.Socket, user:User) {
        for(const users of this.rooms.values()) {
            for(const rankedUser of users.rankedUsers) {
                if(rankedUser.name === user.name) {
                    rankedUser.hasAccepted = true;
                    rankedUser.socketId = socket.id;
                }
            }
        }
    }
    checkForUsersAccept(rankedGame:RankedGame) {
        const timerInterval = setInterval(() => {
            if (rankedGame.secondsValue === 5) {
                clearInterval(timerInterval);
                for(const user of rankedGame.rankedUsers) {
                    if(user.hasAccepted === false)
                    {
                        this.matchRefused(rankedGame);
                        rankedGame.clearTimer();
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
        creatorUser= rankedGame.rankedUsers[0];
        for(const user of rankedGame.rankedUsers) {
            if(user.name === creatorUser.name) {
                await this.sio.sockets.sockets.get(user.socketId)?.emit('createRankedGame', rankedGame.name);
            }
        }
        let i = 3;
        console.log(rankedGame.rankedUsers);
        const timerInterval = setInterval(() => {
        if (rankedGame.secondsValue === i+1) {
            console.log(i);
            // for(const user of rankedGame.rankedUsers) {
                if(rankedGame.rankedUsers[i].name !== creatorUser.name) {
                    this.sio.sockets.sockets.get(rankedGame.rankedUsers[i].socketId)?.emit('joinRankedRoom', rankedGame.name, rankedGame.rankedUsers[i].socketId);
                }
            //}
            if(i !== 0) {
                i -= 1;
            }
        }
        if(rankedGame.secondsValue <= 0) {
            clearInterval(timerInterval);
            rankedGame.clearTimer();
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