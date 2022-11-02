import { Document, model, Schema } from 'mongoose';
import { User } from '@app/classes/users.interface';

const userSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
    },
    password: {
        type: String,
        required: true,
    },
    averagePointsPerGame: {
        type: Number,
        required: true,
    },
    averageTimePerGame: {
        type: Number,
        required: true,
    },
    gamesPlayed: {
        type: Number,
        required: true,
    },
    gamesWon: {
        type: Number,
        required: true,
    },
    avatarPath: {
        type: String,
        required: true,
    },
    avatarUri: {
        type: String,
        required: false,
    },
    favouriteGames: {
        type: [String],
        required: true,
    },
    actionHistory: {
        type: [String],
        required: true,
    },
    gameHistory: {
        type: [String],
        required: true,
    },
});

const userModel = model<User & Document>('User', userSchema);

export default userModel;
