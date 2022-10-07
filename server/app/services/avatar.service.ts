import { HttpException } from '@app/classes/http.exception';
import { isEmpty } from '@app/utils/utils';
import { HTTPStatusCode } from '@app/classes/constants/http-codes';
import AvatarModel from '@app/models/avatar.model';
import { Avatar } from '@app/classes/interfaces/avatar.interface';

class AvatarService {
    avatars = AvatarModel;

    async findAllAvatars(): Promise<Avatar[]> {
        return this.avatars.find();
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
