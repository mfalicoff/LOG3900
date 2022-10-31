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
        if (gameId === '' || gameId === undefined) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no id sent');
        }
        const findFavouriteGame: GameSaved = (await this.gamesSaved.findOne({ _id: gameId })) as GameSaved;
        if (!findFavouriteGame) throw new HttpException(HTTPStatusCode.NotFound, 'Game not found');
        return findFavouriteGame;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async saveFavouriteGame(gameData: GameSaved) {
        if (!gameData) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        const findSavedGame: GameSaved = (await this.gamesSaved.findOne({
            roomName: gameData.roomName,
            players: { $in: gameData.players },
            spectators: { $in: gameData.spectators },
            winners: { $in: gameData.winners },
            numberOfTurns: gameData.numberOfTurns,
            gameStartDate: gameData.gameStartDate,
            nbLetterReserve: gameData.nbLetterReserve,
        })) as GameSaved;
        console.log(gameData);
        console.log(findSavedGame);
        if (findSavedGame) return findSavedGame;

        return await this.gamesSaved.create({
            roomName: gameData.roomName,
            players: gameData.players,
            spectators: gameData.spectators,
            winners: gameData.winners,
            numberOfTurns: gameData.numberOfTurns,
            gameStartDate: gameData.gameStartDate,
            playingTime: gameData.playingTime,
            nbLetterReserve: gameData.nbLetterReserve,
        });
    }
}

export default GameSavedService;
