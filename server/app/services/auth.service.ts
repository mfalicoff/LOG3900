import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CreateUserValidator } from '@app/utils/validators';
import { HttpException } from '@app/classes/http.exception';
import { DataStoredInToken, TokenData } from '@app/classes/auth.interface';
import { User } from '@app/classes/users.interface';
import userModel from '@app/models/users.model';
import { isEmpty } from '@app/utils/utils';
import UserService from '@app/services/user.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { TOKEN_EXPIRATION, WEB_TOKEN_SECRET } from '@app/classes/global-constants';

class AuthService {
    users = userModel;
    userService = new UserService();

    async signup(userData: CreateUserValidator): Promise<User> {
        return this.userService.createUser(userData);
    }

    async login(userData: CreateUserValidator): Promise<{ cookie: string; findUser: User }> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        const findUser = await this.userService.findUserByEmail(userData.email);

        const isPasswordMatching: boolean = await compare(userData.password, findUser.password as string);
        if (!isPasswordMatching) throw new HttpException(HTTPStatusCode.Conflict, "You're password not matching");

        const tokenData = this.createToken(findUser);
        const cookie = this.createCookie(tokenData);

        return { cookie, findUser };
    }

    async logout(userData: User): Promise<User> {
        if (isEmpty(userData)) throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no data sent');

        const findUser: User = (await this.users.findOne({ email: userData.email, password: userData.password })) as User;
        if (!findUser) throw new HttpException(HTTPStatusCode.Conflict, `You're email ${userData.email} not found`);

        return findUser;
    }

    createToken(user: User): TokenData {
        const dataStoredInToken: DataStoredInToken = { _id: user.id as string };
        const secretKey: string = WEB_TOKEN_SECRET;
        const expiresIn: number = TOKEN_EXPIRATION * TOKEN_EXPIRATION;

        return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
    }

    createCookie(tokenData: TokenData): string {
        return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
    }
}

export default AuthService;
