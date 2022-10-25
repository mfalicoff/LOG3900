import { Service } from 'typedi';
import gameSavedModel from '@app/models/game-saved.model';
import { GameSaved } from '@app/classes/game-saved';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { HttpException } from '@app/classes/http.exception';

@Service()
class GameSavedService {
    gamesSaved = gameSavedModel;

    async findAllFavouriteGames(): Promise<GameSaved[]> {
        return this.gamesSaved.find();
    }

    async findGameById(gameId: string): Promise<GameSaved> {
        if (!gameId) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no id sent');
        }
        const findFavouriteGame: GameSaved = (await this.gamesSaved.findOne({ _id: gameId })) as GameSaved;
        if (!findFavouriteGame) throw new HttpException(HTTPStatusCode.NotFound, 'Game not found');
        return findFavouriteGame;
    }

    async addNewFavouriteGame(gameId: string) {
        if (!gameId) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no id sent');
        }
    }
}
