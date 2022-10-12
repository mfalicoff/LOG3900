import { Routes } from '@app/classes/routes.interface';
import { Router } from 'express';
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
        this.router.get(`${this.path}/random`, this.avatarController.getRandomAvatar);
    }
}

export default AvatarRoute;
