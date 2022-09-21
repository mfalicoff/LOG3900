import { GameServer } from '@app/classes/game-server';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';
import { DatabaseService } from './database.service';

@Service()
export class EndGameService {
    constructor(private databaseService: DatabaseService) {}

    // returns the player who won the game
    chooseWinner(game: GameServer): Player[] {
        const players = Array.from(game.mapPlayers.values());
        if (players.length <= 0) {
            return [];
        }
        let winnerPlayer = [new Player('fakePlayer', false)];
        for (const player of players) {
            // subtract the score of the letters still on the stand
            player.score -= this.countDeductedScore(player);
            // adds score final to database
            this.databaseService.addScoreClassicToDb(player);
            // storing the id of the player with the highest score
            if (player.score > winnerPlayer[0].score) {
                // emptying the array
                winnerPlayer = [];
                winnerPlayer.push(player);
            } else if (player.score === winnerPlayer[0].score) {
                winnerPlayer.push(player);
            }
        }
        return winnerPlayer;
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