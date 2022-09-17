import { Injectable } from '@angular/core';
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { RoomData } from '@app/classes/room-data';

@Injectable({
    providedIn: 'root',
})
export class InfoClientService {
    game: GameServer;
    player: Player;

    gameMode: string;
    isLog2990Enabled: boolean;

    // Game parameters
    minutesByTurn: number;
    randomBonusesOn: boolean;
    playerName: string;
    isGamePrivate: boolean;

    // The string displayed in the info pannel
    nameVP1dictionary0: number;
    dictionaries: MockDict[];
    nameVPBeginner: NameVP[];
    nameVPExpert: NameVP[];

    displayTurn: string;
    isTurnOurs: boolean;

    rooms: RoomData[];
    // this old the array of players and spectators in the room
    // it is not in "game" object bc it is stored as maps which canned be sent to the client
    // and we use the players/spectators array to display the players/spectators in the room
    // when on the multiplayer page
    actualRoom: RoomData;

    letterBank: Map<string, LetterData>;

    vpLevel: string;

    // useful to know to hide stands or not
    isSpectator: boolean;

    creatorShouldBeAbleToStartGame: boolean;

    constructor() {
        this.gameMode = GlobalConstants.MODE_MULTI;
        this.isLog2990Enabled = true;
        this.minutesByTurn = 1;
        this.randomBonusesOn = false;
        this.isGamePrivate = false;
        this.playerName = 'DefaultPlayerName';
        this.rooms = [];
        this.initializeService();
    }

    // public bc it is reused to reset for new games
    initializeService() {
        this.game = new GameServer(0, false, GlobalConstants.MODE_SOLO, 'defaultLevel', 'defaultRoom', false, '');
        this.player = new Player('DefaultPlayerObject', false);
        this.displayTurn = "En attente d'un autre joueur...";
        this.isTurnOurs = false;
        this.nameVP1dictionary0 = 0;
        this.vpLevel = 'debutant';
        this.isSpectator = false;
        this.creatorShouldBeAbleToStartGame = false;

        this.letterBank = new Map([
            ['A', { quantity: 9, weight: 1 }],
            ['B', { quantity: 2, weight: 3 }],
            ['C', { quantity: 2, weight: 3 }],
            ['D', { quantity: 3, weight: 2 }],
            ['E', { quantity: 15, weight: 1 }],
            ['F', { quantity: 2, weight: 4 }],
            ['G', { quantity: 2, weight: 2 }],
            ['H', { quantity: 2, weight: 4 }],
            ['I', { quantity: 8, weight: 1 }],
            ['J', { quantity: 1, weight: 8 }],
            ['K', { quantity: 1, weight: 10 }],
            ['L', { quantity: 5, weight: 1 }],
            ['M', { quantity: 3, weight: 2 }],
            ['N', { quantity: 6, weight: 1 }],
            ['O', { quantity: 6, weight: 1 }],
            ['P', { quantity: 2, weight: 3 }],
            ['Q', { quantity: 1, weight: 8 }],
            ['R', { quantity: 6, weight: 1 }],
            ['S', { quantity: 6, weight: 1 }],
            ['T', { quantity: 6, weight: 1 }],
            ['U', { quantity: 6, weight: 1 }],
            ['V', { quantity: 2, weight: 4 }],
            ['W', { quantity: 1, weight: 10 }],
            ['X', { quantity: 1, weight: 10 }],
            ['Y', { quantity: 1, weight: 10 }],
            ['Z', { quantity: 1, weight: 10 }],
            ['*', { quantity: 2, weight: 0 }],
        ]);
        // If gameMode === 'Solo' alors we use the following functions for the VP
        this.nameVPBeginner = [];
        this.nameVPExpert = [];
        this.dictionaries = [];
    }
}
