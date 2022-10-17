// magic number error are linked to the attribution of points for the objectives
// its useless to create new variables therefore we use the following line
/* eslint-disable @typescript-eslint/no-magic-numbers*/
import * as GlobalConstants from '@app/classes/global-constants';
import { LetterData } from '@app/classes/letter-data';
import { Player } from './player';
import { Spectator } from './spectator';
import { Tile } from './tile';
import { Trie } from './trie';

export class GameServer {
    // LETTER BANK SERVICE DATA
    letterBank: Map<string, LetterData>;
    letters: string[];

    roomName: string;

    // BOARD SERVICE DATA
    board: Tile[][];
    trie: Trie;
    // we are obliged to put the esLint disable because the object class we use isnt stable
    // we therefore need to use any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapLetterOnBoard: Map<string, any>;

    bonusBoard: string[][];
    bonuses: string[];

    // EQUIVALENT STAND PLAYER SERVICE DATA
    mapPlayers: Map<string, Player>;
    mapSpectators: Map<string, Spectator>;

    // VALIDATION SERVICE
    noTileOnBoard: boolean;

    // GAME PARAMETERS SERVICE DATA
    randomBonusesOn: boolean;
    gameMode: string;
    minutesByTurn: number;
    isGamePrivate: boolean;
    passwd: string;

    // PLAY AREA SERVICE DATA
    nbLetterReserve: number;
    gameStarted: boolean;
    gameFinished: boolean;
    idxPlayerPlaying: number;
    masterTimer: string;

    // SKIP TURN SERVICE DATA
    displaySkipTurn: string;

    vpLevel: string;

    constructor(
        minutesByTurn: number,
        randomBonusesOn: boolean,
        gameMode: string,
        vpLevel: string,
        roomName: string,
        isGamePrivate: boolean,
        passwd: string,
    ) {
        // Set the basic attributes from the constructor parameters
        this.minutesByTurn = minutesByTurn;
        this.randomBonusesOn = randomBonusesOn;
        this.gameMode = gameMode;
        this.vpLevel = vpLevel;
        this.isGamePrivate = isGamePrivate;
        this.passwd = passwd;

        // Initializing the rest of the variables
        this.trie = new Trie();
        this.letters = [];
        this.board = [];
        this.roomName = roomName;
        this.mapLetterOnBoard = new Map();
        this.mapPlayers = new Map();
        this.mapSpectators = new Map();
        this.nbLetterReserve = GlobalConstants.DEFAULT_NB_LETTER_BANK;
        this.gameStarted = false;
        this.gameFinished = false;
        this.idxPlayerPlaying = -1;
        this.masterTimer = '';
        this.displaySkipTurn = "En attente d'un autre joueur..";
        this.noTileOnBoard = true;

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
        this.initializeLettersArray();
        this.initializeBonusBoard();
    }

    private setMockTiles() {
        this.bonusBoard = [
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx'],
            ['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],
            ['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx'],
            ['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx'],
            ['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx'],
            ['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx'],
        ];
    }

    private initializeBonusBoard(): void {
        this.setMockTiles();
        if (this.randomBonusesOn) {
            const nbOfWordx3 = 8;
            const nbOfWordx2 = 17;
            const nbOfLetterx3 = 12;
            const nbOfLetterx2 = 24;

            const mapBonuses: Map<string, number> = new Map();
            mapBonuses.set('wordx3', nbOfWordx3);
            mapBonuses.set('wordx2', nbOfWordx2);
            mapBonuses.set('letterx3', nbOfLetterx3);
            mapBonuses.set('letterx2', nbOfLetterx2);

            const columns = 15;
            const rows = 15;

            this.initializeBonusesArray(mapBonuses);

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < columns; j++) {
                    if (this.bonusBoard[i][j] !== 'xx') {
                        let clear = false;
                        while (!clear) {
                            const random = this.generateRandomNumber();
                            const key = this.bonuses[random];
                            if (key && key !== undefined) {
                                this.bonusBoard[i][j] = key;
                                this.bonuses.splice(random, 1);
                                clear = true;
                            }
                        }
                    }
                }
            }
        }
    }

    private initializeBonusesArray(mapBonuses: Map<string, number>) {
        this.bonuses = new Array<string>();
        for (const key of mapBonuses.keys()) {
            const bonusNumber = mapBonuses.get(key);
            if (bonusNumber) {
                for (let i = 0; i < bonusNumber; i++) {
                    this.bonuses.push(key);
                }
            }
        }
    }

    private initializeLettersArray(): void {
        this.letters = new Array<string>();
        for (const key of this.letterBank.keys()) {
            const letterData = this.letterBank.get(key)?.quantity;
            if (letterData) {
                for (let i = 0; i < letterData; i++) {
                    this.letters.push(key);
                }
            }
        }
    }

    private generateRandomNumber() {
        const maxNumberGenerated = 61;
        return Math.floor(Math.random() * (maxNumberGenerated + 1)); // aléatoire entre 0 et 3
    }
}
