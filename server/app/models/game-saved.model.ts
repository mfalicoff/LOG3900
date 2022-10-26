import { Document, model, Schema } from 'mongoose';
import { GameSaved } from '@app/classes/game-saved';

const gameSavedSchema: Schema = new Schema({
    players: {
        type: [String],
        required: true,
    },
    spectators: {
        type: [String],
        required: false,
    },
    winners: {
        type: [String],
        required: false,
    },
    roomName: {
        type: String,
        required: true,
    },
    numberOfTurns: {
        type: Number,
        required: true,
    },
    gameStartDate: {
        type: String,
        required: true,
    },
    playingTime: {
        type: String,
        required: true,
    },
    nbLetterReserve: {
        type: Number,
        required: true,
    },
});

const gameSavedModel = model<GameSaved & Document>('Saved-Games', gameSavedSchema);

export default gameSavedModel;
