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

    initPowerCards(game: GameServer, activationState: boolean[]){
        console.log("activationState");
        console.log(activationState);
        for(let i = 0; i < game.powerCards.length; i++){
            game.powerCards[i].isActivated = activationState[i];
        }
    }

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

    powerCardsHandler(game: GameServer, player: Player, powerCardName: string, additionnalParams: string){
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
                this.exchangeStand(game, player, additionnalParams);
                break;
            }
            case Constants.REMOVE_POINTS_FROM_MAX:{
                this.removePointsFromMax(game);
                break;
            }
            case Constants.ADD_1_MIN:{
                this.add1MinToPlayerTime(game);
                break;
            }
            case Constants.REMOVE_1_POWER_CARD_FOR_EVERYONE:{
                this.remove1PowerCardForEveryone(game, player.name);
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

    private exchangeStand(game: GameServer, player: Player, playerTargetName: string){
        const playerTarget = game.mapPlayers.get(playerTargetName);
        if(playerTarget === undefined){
            return;
        }
        const playerStand = player.stand;
        player.stand = playerTarget.stand;
        playerTarget.stand = playerStand;

        this.playAreaService.sendMsgToAllInRoom(
            game,
            "Le joueur " + player.name 
            + " a utilisé une carte de pouvoir pour échanger son stand avec " 
            + playerTargetName + "!"  
        );
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

    private add1MinToPlayerTime(game: GameServer){
        const timeToAdd = 60;
        this.playAreaService.addSecsToTimePlayer(game, timeToAdd);
    }

    private remove1PowerCardForEveryone(game: GameServer, playerNameUsingCard: string){
        for(let player of game.mapPlayers.values()){
            if(player.name === playerNameUsingCard){
                continue;
            }
            if(player.powerCards.length > 0){
                this.deletePowerCard(player, player.powerCards[0].name);
            }
        }
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
        console.log("all powercards are");
        console.log(game.powerCards)
        const availablePowerCards = game.powerCards.filter(powerCard => powerCard.isActivated);
        console.log("availablePowerCards: ", availablePowerCards);
        const randomCard = availablePowerCards[Math.floor(Math.random() * availablePowerCards.length)];
        console.log("randomCard: ", randomCard);
        return randomCard;
    }
}