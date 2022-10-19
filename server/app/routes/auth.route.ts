import { Router } from 'express';
import AuthController from '@app/controllers/auth.controller';
import { CreateUserValidator, LoginUserValidator, validationMiddleware } from '@app/utils/validators';
import { Routes } from '@app/classes/routes.interface';
import { authMiddleware } from '@app/utils/auth';

class AuthRoute implements Routes {
    path = '/';
    router = Router();
    authController = new AuthController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(`${this.path}signup`, validationMiddleware(CreateUserValidator, 'body'), this.authController.signUp);
        this.router.post(`${this.path}login`, validationMiddleware(LoginUserValidator, 'body'), this.authController.logIn);
        this.router.post(`${this.path}logout`, authMiddleware, this.authController.logOut);
    }
}

export default AuthRoute;
