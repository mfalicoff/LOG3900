import { Router } from 'express';
import { Routes } from '@app/classes/routes.interface';
import { authMiddleware } from '@app/utils/auth';
import AvatarController from '@app/controllers/avatar.controller';

class AvatarRoute implements Routes {
    path = '/avatar';
    router = Router();
    avatarController = new AvatarController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(`${this.path}`, this.avatarController.getAllAvatars);
        this.router.get(`${this.path}/:id`, this.avatarController.getAvatarById);
        this.router.post(`${this.path}`, authMiddleware, this.avatarController.createAvatar);
        this.router.delete(`${this.path}/:id`, authMiddleware, this.avatarController.deleteAvatar);
    }
}

export default AvatarRoute;
