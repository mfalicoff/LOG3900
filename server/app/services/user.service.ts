import { hash } from 'bcrypt';
import { HttpException } from '@app/classes/http.exception';
import { User } from '@app/classes/users.interface';
import { isEmpty } from '@app/utils/utils';
import { CreateUserValidator } from '@app/utils/validators';
import userModel from '@app/models/users.model';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { SALT_ROUNDS } from '@app/classes/global-constants';
import { addActionHistory } from '@app/utils/auth';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';

@Service()
class UserService {
    users = userModel;

    async findAllUser(): Promise<User[]> {
        return this.users.find();
    }

    async findUserById(userId: string): Promise<User> {
        if (isEmpty(userId)) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no id sent');
        }

        const findUser: User = (await this.users.findOne({ _id: userId })) as User;
        if (!findUser) throw new HttpException(HTTPStatusCode.NotFound, 'User not found');

        return findUser;
    }

    async createUser(userData: CreateUserValidator): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'No data sent');

        let findUser: User = (await this.users.findOne({ email: userData.email })) as User;
        if (findUser) throw new HttpException(HTTPStatusCode.Conflict, `You're email ${userData.email} already exists`);

        findUser = (await this.users.findOne({ name: userData.name })) as User;
        if (findUser) throw new HttpException(HTTPStatusCode.Conflict, `The username: ${userData.name} already exists`);

        const hashedPassword = await hash(userData.password, SALT_ROUNDS);
        return await this.users.create({
            ...userData,
            password: hashedPassword,
            averagePointsPerGame: 0,
            averageTimePerGame: 0,
            gamesPlayed: 0,
            gamesWon: 0,
            actionHistory: [addActionHistory('creation')],
            gameHistory: [],
        });
    }

    // On ne peut que changer le email, username ou password pour l'instant
    async updateUser(userId: string, userData: CreateUserValidator): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'No data sent');

        if (userData.email) {
            const findUser: User = (await this.users.findOne({ email: userData.email })) as User;
            if (findUser && findUser.id !== userId) throw new HttpException(HTTPStatusCode.Conflict, `You're email ${userData.email} already exists`);
        }

        if (userData.name) {
            const findUser: User = (await this.users.findOne({ name: userData.name })) as User;
            if (findUser && findUser.id !== userId) throw new HttpException(HTTPStatusCode.Conflict, `The username: ${userData.name} already exists`);
        }

        if (userData.password) {
            const hashedPassword = await hash(userData.password, SALT_ROUNDS);
            userData = { ...userData, password: hashedPassword };
        }

        const updateUserById: User = (await this.users.findByIdAndUpdate(userId, { userData })) as User;
        if (!updateUserById) throw new HttpException(HTTPStatusCode.NotFound, 'User not found');

        return updateUserById;
    }

    async deleteUser(userId: string): Promise<User> {
        const deleteUserById: User = (await this.users.findByIdAndDelete(userId)) as User;
        if (!deleteUserById) throw new HttpException(HTTPStatusCode.NotFound, 'User not found');

        return deleteUserById;
    }

    async findUserByEmail(userEmail: string): Promise<User> {
        if (isEmpty(userEmail)) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no email sent');
        }

        const findUser: User = (await this.users.findOne({ email: userEmail })) as User;
        if (!findUser) throw new HttpException(HTTPStatusCode.NotFound, 'User not found');

        return findUser;
    }

    async updateStatsAtEndOfGame(gameLength: number, player: Player): Promise<void> {
        if (player.idPlayer === 'virtualPlayer') return;
        const findUser: User = (await this.users.findOne({ name: player.name })) as User;

        const currentAverageTime = findUser.averageTimePerGame as number;
        const currentAveragePoints = findUser.averagePointsPerGame as number;

        const newGamesPlayed = (findUser.gamesPlayed as number) + 1;
        const newAverageTimePerGame = currentAverageTime + (gameLength - currentAverageTime) / newGamesPlayed;
        const newAveragePointsPerGame = currentAveragePoints + (player.score - currentAveragePoints) / newGamesPlayed;

        await this.users.updateOne({ name: player.name }, { gamesPlayed: newGamesPlayed });
        await this.users.updateOne({ name: player.name }, { averageTimePerGame: newAverageTimePerGame });
        await this.users.updateOne({ name: player.name }, { averagePointsPerGame: newAveragePointsPerGame });
    }

    async updateWinHistory(player: Player): Promise<void> {
        if (player.idPlayer === 'virtualPlayer') return;

        const findUser: User = (await this.users.findOne({ name: player.name })) as User;
        const newGamesWon = (findUser.gamesWon as number) + 1;
        await this.users.updateOne({ name: player.name }, { gamesWon: newGamesWon });
    }

    async updateGameHistory(player: Player, didPlayerWin: boolean, gameStart: number): Promise<void> {
        if (player.idPlayer === 'virtualPlayer') return;

        const start = new Date(gameStart);
        if (didPlayerWin)
            await this.users.updateOne(
                { name: player.name },
                { $push: { gameHistory: `Partie Gagne le ${start.toLocaleString()}:${start.toDateString()}` } },
            );
        else
            await this.users.updateOne(
                { name: player.name },
                { $push: { gameHistory: `Partie Perdu le ${start.toLocaleString()}:${start.toDateString()}` } },
            );
    }
}

export default UserService;
