import { NextFunction, Request, Response } from 'express';
import { CreateUserValidator } from '@app/utils/validators';
import { User } from '@app/classes/users.interface';
import UserService from '@app/services/user.service';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';

/* eslint-disable no-invalid-this */

class UsersController {
    userService = new UserService();

    getUsers = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllUsersData: User[] = await this.userService.findAllUser();

            res.status(HTTPStatusCode.OK).json({ data: findAllUsersData, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    getUserById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const findOneUserData: User = await this.userService.findUserById(userId);

            res.status(HTTPStatusCode.OK).json({ data: findOneUserData, message: 'findOne' });
        } catch (error) {
            next(error);
        }
    };

    createUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userData: CreateUserValidator = req.body;
            const createUserData: User = await this.userService.createUser(userData);

            res.status(HTTPStatusCode.Created).json({ data: createUserData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };

    updateUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const userData: CreateUserValidator = req.body;
            const updateUserData: User = await this.userService.updateUser(userId, userData);

            res.status(HTTPStatusCode.OK).json({ data: updateUserData, message: 'updated' });
        } catch (error) {
            next(error);
        }
    };

    deleteUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId: string = req.params.id;
            const deleteUserData: User = await this.userService.deleteUser(userId);

            res.status(HTTPStatusCode.OK).json({ data: deleteUserData, message: 'deleted' });
        } catch (error) {
            next(error);
        }
    };
}

export default UsersController;
