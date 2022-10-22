import * as Constants from '@app/classes/global-constants';
import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { PowerCard } from '@app/classes/power-card';
import { Service } from 'typedi';
import { PlayAreaService } from './play-area.service';

@Service()
export class PowerCardsService {
    constructor(
        private playAreaService: PlayAreaService,
    ){}
    givePowerToPlayers(game: GameServer){
        for(let player of game.mapPlayers.values()){
            while(player.powerCards.length < 3){
                this.givePowerCard(game, player);
            }
        }
    }

    //function that fills the player's power cards
    givePowerCard(game: GameServer, player: Player){
        console.log("givingPowerTo: " + player.name);
        if(player.powerCards.length < 3){
            player.powerCards.push(this.getRandomPower(game));
        }
    }

    powerCardsHandler(game: GameServer, player: Player, powerCardName: string){
        //delete the powercard from the player's hand
        this.deletePowerCard(player, powerCardName);
        //give a new powercard to the player
        this.givePowerCard(game, player);

        switch(powerCardName){
            case Constants.JUMP_NEXT_ENNEMY_TURN:{
                this.jmpNextEnnemyTurn(game);
                break;
            }
            case Constants.TRANFORM_EMPTY_TILE:{
                this.transformEmptyTile(game);
                break;
            }
            case Constants.REDUCE_ENNEMY_TIME:{
                this.reduceEnnemyTime(game);
                break;
            }
            case Constants.EXCHANGE_LETTER_JOKER:{
                this.exchangeLetterJoker(game, player);
                break;
            }
            case Constants.EXCHANGE_STAND:{
                this.exchangeStand(game, player);
                break;
            }
            case Constants.REMOVE_POINTS_FROM_MAX:{
                this.removePointsFromMax(game);
                break;
            }
            default:
                return;
        }
    }

    private jmpNextEnnemyTurn(game: GameServer){
        game.jmpNextEnnemyTurn = true;
    }

    private transformEmptyTile(game: GameServer){
        //TODO
    }

    private reduceEnnemyTime(game: GameServer){
        game.reduceEnnemyNbTurn = 3;
    }

    private exchangeLetterJoker(game: GameServer, player: Player){
        //TODO
    }

    private exchangeStand(game: GameServer, player: Player){
        //TODO
    }

    private removePointsFromMax(game: GameServer){
        const pointsToRm = 20;
        const playerWithMaxScore = this.findPlayerWithMaxScore(game);
        playerWithMaxScore.score -= pointsToRm;
        for(let player of game.mapPlayers.values()){
            player.score += pointsToRm/(game.mapPlayers.size);
        }
        this.playAreaService.sendMsgToAllInRoom(
            game,
            "Le joueur " + playerWithMaxScore.name 
            + " a perdu " + pointsToRm + " points."  
            + "Ces points ont été répartis entre tout les joueurs."
        );
    }

    private findPlayerWithMaxScore(game: GameServer): Player{
        let playerWithMaxScore: Player = new Player("maxScoreDefaultPlayer", false);
        let maxPoints = -100;
        for(let player of game.mapPlayers.values()){
            if(player.score > maxPoints){
                maxPoints = player.score;
                playerWithMaxScore = player;
            }
        }
        return playerWithMaxScore;
    }

    private deletePowerCard(player: Player, powerCardName: string){
        for(let powerCard of player.powerCards){
            if(powerCard.name === powerCardName){
                player.powerCards.splice(player.powerCards.indexOf(powerCard), 1);
                return;
            }
        }
    }

    private getRandomPower(game: GameServer): PowerCard {
        const availablePowerCards = game.powerCards.filter(powerCard => powerCard.isActivated);
        const randomCard = availablePowerCards[Math.floor(Math.random() * availablePowerCards.length)];
        return randomCard;
    }
}