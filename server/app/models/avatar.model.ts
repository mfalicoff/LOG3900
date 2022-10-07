import { Document, model, Schema } from 'mongoose';
import { Avatar } from '@app/classes/interfaces/avatar.interface';

const avatarSchema = new Schema({
    avatar: {
        type: String,
        required: true,
    },
});

const avatarModel = model<Avatar & Document>('Semester', avatarSchema);

export default avatarModel;
