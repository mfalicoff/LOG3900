import { HttpException } from '@app/classes/http.exception';
import { isEmpty } from '@app/utils/utils';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import AvatarModel from '@app/models/avatar.model';
import { Avatar } from '@app/classes/interfaces/avatar.interface';
import * as fs from 'fs';
import * as path from 'path';

const PREFIX_URL = 'data:image/png;base64,';

class AvatarService {
    avatars = AvatarModel;
    assetDir = path.join(__dirname, '..', 'assets', 'avatars');

    async findAllAvatars(): Promise<Avatar[]> {
        const avatars: Avatar[] = [];
        for (let i = 1; i <= 8; i++) {
            const filePath = `${this.assetDir}/avatar${i}.png`;
            const file = fs.readFileSync(filePath);
            const fileURL = PREFIX_URL.concat(file.toString('base64'));
            avatars.push({
                uri: fileURL,
                path: filePath,
            });
        }
        return avatars;
    }

    async findAvatarByPath(avatarPath: string): Promise<string> {
        const filePath = `${this.assetDir}/${avatarPath}.png`;
        const file = fs.readFileSync(filePath);
        return PREFIX_URL.concat(file.toString('base64'));
    }

    async findAvatarById(avatarId: string): Promise<Avatar> {
        if (isEmpty(avatarId)) {
            throw new HttpException(HTTPStatusCode.BadRequest, 'Bad request: no id sent');
        }

        const findAvatar: Avatar = (await this.avatars.findOne({ _id: avatarId })) as Avatar;
        if (!findAvatar) throw new HttpException(HTTPStatusCode.NotFound, 'Avatar not found');

        return findAvatar;
    }

    async createAvatar(avatarData: Avatar): Promise<Avatar> {
        if (isEmpty(avatarData)) throw new HttpException(HTTPStatusCode.BadRequest, 'No data sent');

        const findAvatar: Avatar = (await this.avatars.findOne({ avatar: avatarData.uri })) as Avatar;
        if (findAvatar) throw new HttpException(HTTPStatusCode.Conflict, 'The Avatar already exists');

        return await this.avatars.create(avatarData);
    }

    async deleteAvatar(avatarId: string): Promise<Avatar> {
        const deleteAvatarById: Avatar = (await this.avatars.findByIdAndDelete(avatarId)) as Avatar;
        if (!deleteAvatarById) throw new HttpException(HTTPStatusCode.NotFound, 'Avatar not found');

        return deleteAvatarById;
    }
}

export default AvatarService;
