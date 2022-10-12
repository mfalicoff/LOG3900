import { Avatar } from '@app/classes/interfaces/avatar.interface';
import * as fs from 'fs';
import * as path from 'path';

const PREFIX_URL = 'data:image/png;base64,';
const DEFAULT_AVATAR_COUNT = 8;

class AvatarService {
    assetDir = path.join(__dirname, '..', 'assets', 'avatars');

    async findAllAvatars(): Promise<Avatar[]> {
        const avatars: Avatar[] = [];
        for (let i = 1; i <= DEFAULT_AVATAR_COUNT; i++) {
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

    async getRandomAvatar(): Promise<string> {
        const randomNumber = Math.floor(Math.random() * DEFAULT_AVATAR_COUNT) + 1;
        const filePath = `${this.assetDir}/avatar${randomNumber}.png`;
        const file = fs.readFileSync(filePath);
        return PREFIX_URL.concat(file.toString('base64'));
    }
}

export default AvatarService;
