import { Document, model, Schema } from 'mongoose';
import { GameSaved } from '@app/classes/game-saved';
import { Player } from '@app/classes/player';
import { Spectator } from '@app/classes/spectator';

const gameSavedSchema: Schema = new Schema({
    players: {
        type: [Player],
        required: true,
        unique: true,
    },
    spectators: {
        type: [Spectator],
        required: false,
    },
    winners: {
        type: [Player],
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
    mapLettersOnStand: {
        type: new Map<Player, string>(),
        required: true,
    },
});

const gameSavedModel = model<GameSaved & Document>('gamesSaved', gameSavedSchema);

export default gameSavedModel;
