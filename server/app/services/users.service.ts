import { hash } from 'bcrypt';
import { HttpException } from '@app/classes/http.exception';
import { User } from '@app/classes/users.interface';
import { isEmpty } from '@app/utils/utils';
import { CreateUserValidator } from '@app/utils/validators';
import userModel from '@app/models/users.model';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { SALT_ROUNDS } from '@app/classes/global-constants';

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

        const findUser: User = (await this.users.findOne({ email: userData.email })) as User;
        if (findUser) throw new HttpException(HTTPStatusCode.Conflict, `You're email ${userData.email} already exists`);

        const hashedPassword = await hash(userData.password, SALT_ROUNDS);
        return await this.users.create({ ...userData, password: hashedPassword });
    }

    // On ne peut que changer le email ou password pour l'instant
    async updateUser(userId: string, userData: CreateUserValidator): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'No data sent');

        if (userData.email) {
            const findUser: User = (await this.users.findOne({ email: userData.email })) as User;
            if (findUser && findUser.id !== userId) throw new HttpException(HTTPStatusCode.Conflict, `You're email ${userData.email} already exists`);
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
}

export default UserService;
