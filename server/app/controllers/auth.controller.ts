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
        } catch (error) {
            next(error);
        }
    };

    logIn = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserValidator = req.body;
            const { cookie, findUser } = await this.authService.login(userData);

            res.setHeader('Set-Cookie', [cookie]);
            res.status(HTTPStatusCode.OK).json({ data: findUser, message: 'logged in' });
        } catch (error) {
            next(error);
        }
    };

    logOut = async (req: Request, res: Response, next: NextFunction) => {
        try {
            res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
            res.status(HTTPStatusCode.OK).json({ message: 'logged out' });
        } catch (error) {
            next(error);
        }
    };
}

export default AuthController;
