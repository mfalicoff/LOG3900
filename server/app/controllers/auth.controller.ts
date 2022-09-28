import { NextFunction, Request, Response } from 'express';
import { CreateUserValidator } from '@app/utils/validators';
import { User } from '@app/classes/users.interface';
import AuthService from '@app/services/auth.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';

/* eslint-disable no-invalid-this */

class AuthController {
    authService = new AuthService();

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserValidator = req.body;
            const signUpUserData: User = await this.authService.signup(userData);

            res.status(HTTPStatusCode.Created).json({ data: signUpUserData, message: 'signup' });
            console.log(res);
        } catch (error) {
            console.log("error");
            next(error);
        }
    };

    logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserValidator = req.body;
            const { cookie, findUser } = await this.authService.login(userData);

            // res.setHeader('Access-Control-Allow-Credentials', 'true');
            // res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
            // res.setHeader('Access-Control-Allow-Headers', 'Origin, Content-Type, Accept');
            // res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.setHeader('Set-Cookie', [cookie]);
            res.status(HTTPStatusCode.OK).json({ data: findUser, message: 'logged in' });
            console.log(res);
        } catch (error) {
            console.log("error");
            next(error);
        }
    };

    logOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // @ts-ignore
            // eslint-disable-next-line no-underscore-dangle
            const id = (req as unknown).user._doc._id.valueOf();
            await this.authService.logout(id);
            res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
            res.status(HTTPStatusCode.OK).json({ message: 'logged out' });
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
