import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class EndGameService {
    sio: io.Server;
    constructor(private databaseService: DatabaseService) {
        this.sio = new io.Server();
    }

    // returns the player who won the game
    chooseWinner(game: GameServer): Player[] {
        const players = Array.from(game.mapPlayers.values());
        if (players.length <= 0) {
            return [];
        }
        let bestScore = 0;
        for (const player of players) {
            //subtract the score of the letters still on the stand
            player.score -= this.countDeductedScore(player);
            // adds score final to database
            this.databaseService.addScoreClassicToDb(player);
            // storing the id of the player with the highest score
            if (player.score > bestScore) {
                // emptying the array
                game.winners = [];
                game.winners.push(player);
                bestScore = player.score;
            } else if (player.score === bestScore) {
                game.winners.push(player);
            }
        }
        return game.winners;
    }

    listLetterStillOnStand(player: Player): string[] {
        const listLetterStillOnStand: string[] = new Array<string>();
        for (const tile of player.stand) {
            if (tile.letter.value !== '') {
                listLetterStillOnStand.push(tile.letter.value);
            }
        }
        return listLetterStillOnStand;
    }

    private countDeductedScore(player: Player): number {
        let scoreDeducted = 0;
        for (const tile of player.stand) {
            if (tile.letter.weight) {
                scoreDeducted += tile.letter.weight;
            }
        }
        return scoreDeducted;
    }
}
