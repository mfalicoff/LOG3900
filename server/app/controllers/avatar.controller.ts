import { NextFunction, Request, Response } from 'express';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import { Avatar } from '@app/classes/interfaces/avatar.interface';
import AvatarService from '@app/services/avatar.service';

/* eslint-disable no-invalid-this */

class AvatarController {
    avatarService = new AvatarService();

    getAllAvatars = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const findAllAvatars: Avatar[] = await this.avatarService.findAllAvatars();

            res.status(HTTPStatusCode.OK).json({ data: findAllAvatars, message: 'findAll' });
        } catch (error) {
            next(error);
        }
    };

    getAvatarById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const avatarId: string = req.params.id;
            const findOneAvatarData: Avatar = await this.avatarService.findAvatarById(avatarId);

            res.status(HTTPStatusCode.OK).json({ data: findOneAvatarData, message: 'findOne' });
        } catch (error) {
            next(error);
        }
    };

    createAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const avatarData: Avatar = req.body;
            const createAvatarData: Avatar = await this.avatarService.createAvatar(avatarData);

            res.status(HTTPStatusCode.Created).json({ data: createAvatarData, message: 'created' });
        } catch (error) {
            next(error);
        }
    };

    deleteAvatar = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const avatarId: string = req.params.id;
            const deleteAvatarData: Avatar = await this.avatarService.deleteAvatar(avatarId);

            res.status(HTTPStatusCode.OK).json({ data: deleteAvatarData, message: 'deleted' });
        } catch (error) {
            next(error);
        }
    };
}

export default AvatarController;
