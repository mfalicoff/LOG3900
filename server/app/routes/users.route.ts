import { Router } from 'express';
import UsersController from '@app/controllers/users.controller';
import { CreateUserValidator, validationMiddleware } from '@app//utils/validators';
import { Routes } from '@app/classes/routes.interface';
import { authMiddleware } from '@app/utils/auth';

class UsersRoute implements Routes {
    path = '/users';
    router = Router();
    usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.usersController.getUsers);
        // TODO Should this be protected too ?
        this.router.get(`${this.path}/:name`, this.usersController.getUserByName);
        this.router.get(`${this.path}/:id`, this.usersController.getUserById);
        this.router.post(`${this.path}`, validationMiddleware(CreateUserValidator, 'body'), this.usersController.createUser);
        this.router.put(`${this.path}/:id`, authMiddleware, validationMiddleware(CreateUserValidator, 'body', true), this.usersController.updateUser);
        this.router.patch(`${this.path}/:id`, this.usersController.updateFavouriteGames);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.usersController.deleteUser);
    }
}

export default UsersRoute;
