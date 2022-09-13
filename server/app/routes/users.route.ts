import { Router } from 'express';
import UsersController from '@app/controllers/users.controller';
import { CreateUserValidator, validationMiddleware } from '@app//utils/validators';
import { Routes } from '@app/classes/routes.interface';

class UsersRoute implements Routes {
    path = '/users';
    router = Router();
    usersController = new UsersController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.usersController.getUsers);
        this.router.get(`${this.path}/:id`, this.usersController.getUserById);
        this.router.post(`${this.path}`, validationMiddleware(CreateUserValidator, 'body'), this.usersController.createUser);
        // TODO this route should be protected
        this.router.put(`${this.path}/:id`, validationMiddleware(CreateUserValidator, 'body', true), this.usersController.updateUser);
        // TODO this route should be protected
        this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
    }
}

export default UsersRoute;
