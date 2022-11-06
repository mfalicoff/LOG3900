/* eslint-disable max-lines */
import { ChatMessage } from '@app/classes/chat-message.interface';
import { DictJSON } from '@app/classes/dict-json';
import { GameServer } from '@app/classes/game-server';
import * as Constants from '@app/classes/global-constants';
import { MockDict } from '@app/classes/mock-dict';
import { NameVP } from '@app/classes/names-vp';
import { Player } from '@app/classes/player';
import { Score } from '@app/classes/score';
import { Spectator } from '@app/classes/spectator';
import { Tile } from '@app/classes/tile';
import { User } from '@app/classes/users.interface';
import avatarService from '@app/services/avatar.service';
import UserService from '@app/services/user.service';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';
import { BoardService } from './board.service';
import { ChatService } from './chat.service';
import { CommunicationBoxService } from './communication-box.service';
import { DatabaseService } from './database.service';
import { DictionaryService } from './dictionary.service';
import { LetterBankService } from './letter-bank.service';
import { MatchmakingService } from './matchmaking.service';
import { MouseEventService } from './mouse-event.service';
import { PlayAreaService } from './play-area.service';
import { PowerCardsService } from './power-cards.service';
import { PutLogicService } from './put-logic.service';
import { StandService } from './stand.service';

@Service()
export class SocketManager {
    sio: io.Server;
    // Users with <socketId, {nomJoueur, roomName}>
    users: Map<string, User>;

    rooms: Map<string, GameServer>;
    scoreClassic: Score[];
    scoreLOG2990: Score[];
    chatHistory: ChatMessage[] = [];
    private userService = new UserService();
    private avatarService = new avatarService();

    constructor(
        server: http.Server,
        private mouseEventService: MouseEventService,
        private communicationBoxService: CommunicationBoxService,
        private playAreaService: PlayAreaService,
        private chatService: ChatService,
        private boardService: BoardService,
        private putLogicService: PutLogicService,
        private databaseService: DatabaseService,
        private dictionaryService: DictionaryService,
        private matchmakingService: MatchmakingService,
        private standService: StandService,
        private powerCardsService: PowerCardsService,
        private letterBankService: LetterBankService,
    ) {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.users = new Map<string, User>();
        this.rooms = new Map<string, GameServer>();
        this.matchmakingService.initSioMatchmaking(this.sio);
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            this.clientAndRoomHandler(socket);
            // handling event from client
            this.clientEventHandler(socket);
            // handling communicationBoxInput
            this.commBoxInputHandler(socket);
            // handling disconnection and abandonnement
            this.disconnectAbandonHandler(socket);
            // handling dictionnaries, VP names and highscores
            this.adminHandler(socket);
            // handling the ranked/matchmaking events
            this.rankedHandler(socket);
            this.searchHandler(socket);
        });
    }

    // The virtual player never calls this function
    private manageNewMessageClient(placeMsg: string, socket: io.Socket) {
        const user = this.users.get(socket.id);
        if (!user) {
            return;
        }
        const game = this.rooms.get(user.roomName);
        if (!game) {
            return;
        }
        const player = game.mapPlayers.get(user.name);
        const spectator = game.mapSpectators.get(socket.id);
        if (!player && !spectator) {
            return;
        }
        if (player) {
            this.communicationBoxService.onEnterPlayer(game, player, placeMsg);
        } else if (spectator) {
            this.communicationBoxService.onEnterSpectator(game, spectator, placeMsg);
        }

        // We update the chatHistory and the game of each client
        this.gameUpdateClients(game);
        if (game.gameFinished) {
            this.triggerStopTimer(user.roomName);
        }
    }

    private clientEventHandler(socket: io.Socket) {
        socket.on('turnFinished', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            const player = game?.mapPlayers.get(user.name);
            if (game && player) {
                this.chatService.passCommand('!passer', game, player);
                this.playAreaService.changePlayer(game);
            }
        });

        socket.on('boardClick', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.boardClick(player);
            }
        });

        socket.on('onExchangeClick', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            const game = this.rooms.get(user.roomName);
            if (game && player) {
                this.mouseEventService.exchangeButtonClicked(game, player);
            }
        });

        socket.on('onAnnulerClick', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.cancelButtonClicked(player);
            }
        });

        socket.on('keyboardSelection', (eventString: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.keyboardSelection(player, eventString);
            }
        });

        socket.on('keyboardAndMouseManipulation', (eventString: string) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);
            const game = this.rooms.get(user.roomName);

            if (player && game) {
                this.mouseEventService.keyboardAndMouseManipulation(game, player, eventString);
            }
        });

        socket.on('leftClickSelection', (coordinateXClick) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.leftClickSelection(player, coordinateXClick);
            }
        });

        socket.on('rightClickExchange', (coordinateXClick) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);
            if (player) {
                this.mouseEventService.rightClickExchange(player, coordinateXClick);
            }
        });

        socket.on('resetAllTilesStand', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const player = this.rooms.get(user.roomName)?.mapPlayers.get(user.name);

            if (player) {
                this.mouseEventService.resetAllTilesStand(player);
            }
        });

        socket.on('dbReception', async () => {
            this.scoreClassic = (await this.databaseService.bestScoreClassicCollection.getScoreClassic()) as Score[];
            this.scoreLOG2990 = (await this.databaseService.bestScoreLOG2990Collection.getScoreLOG2990()) as Score[];

            socket.emit('sendScoreDb', this.scoreClassic, this.scoreLOG2990);
        });

        socket.on('dictionarySelected', async (dictionary: MockDict) => {
            this.dictionaryService.gameDictionary = (await this.databaseService.dictionariesCollection.getDictionary(dictionary.title)) as DictJSON;
            const player = this.users.get(socket.id);
            if (player) {
                const game = this.rooms.get(player?.roomName);
                if (game) {
                    this.dictionaryService.createLexicon(game.trie);
                }
            }
        });

        socket.on('callTestFunction', () => {
            const game = new GameServer(0, Constants.CLASSIC_MODE, 'defaultRoom', false, '');
            this.boardService.initBoardArray(game);
            socket.emit('gameBoardUpdate', game);
            // const gameStub = new GameServer(
            //     1, false,
            //     'null', false,
            //     'expert', 'test', false);
            // const userStub = { name: 'test', roomName: 'test' };
            // this.joinGameAsSpectator(socket, gameStub, userStub);
        });

        socket.on('addTempLetterBoard', (keyEntered, xIndex, yIndex) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.addTempLetterBoard(game, keyEntered, xIndex, yIndex);
            // We send to all clients a gameState
            this.sio.to(game.roomName).emit('gameBoardUpdate', game);
        });

        socket.on('rmTempLetterBoard', (idxsTileToRm) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.rmTempLetterBoard(game, idxsTileToRm);
            // We send to all clients a gameState
            this.gameUpdateClients(game);
        });

        socket.on('rmTileFromStand', (tile: Tile) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.mouseEventService.rmTileFromStand(player, tile);
            this.gameUpdateClients(game);
        });

        socket.on('addTileToStand', (letterToAdd) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.mouseEventService.addTileToStand(game, player, letterToAdd);
            this.gameUpdateClients(game);
        });

        socket.on('onBoardToStandDrop', (tileDropped, standIdx) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.mouseEventService.onBoardToStandDrop(tileDropped, standIdx, player, game);
            this.gameUpdateClients(game);
        });

        socket.on('onBoardToBoardDrop', (posClickedTileIdxs, posDropBoardIdxs) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.mouseEventService.onBoardToBoardDrop(game, posClickedTileIdxs, posDropBoardIdxs);
            this.sio.to(game.roomName).emit('gameBoardUpdate', game);
        });

        socket.on('drawBorderTileForTmpHover', (boardIndexs) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName).emit('drawBorderTileForTmpHover', boardIndexs);
        });

        socket.on('tileDraggedOnCanvas', (clickedTile, mouseCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName).emit('tileDraggedOnCanvas', clickedTile, mouseCoords);
        });

        socket.on('clearTmpTileCanvas', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            this.sio.to(game.roomName).emit('clearTmpTileCanvas');
        });

        socket.on('escapeKeyPressed', (tmpLettersOnBoard) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.boardService.rmTempTiles(game);
            this.standService.putLettersOnStand(game, tmpLettersOnBoard, player);
            // we tell all the client to clear the clearTmpTileCanvas
            this.sio.to(game.roomName).emit('clearTmpTileCanvas', game);
            // we update the board state
            this.gameUpdateClients(game);
        });

        socket.on('drawVerticalArrow', (arrowCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            // there can never be multiples arrows on the board so we clear
            // the canvas first
            this.sio.to(game.roomName).emit('clearTmpTileCanvas');
            this.sio.to(game.roomName).emit('drawVerticalArrow', arrowCoords);
        });

        socket.on('drawHorizontalArrow', (arrowCoords) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            // there can never be multiples arrows on the board so we clear
            // the canvas first
            this.sio.to(game.roomName).emit('clearTmpTileCanvas');
            this.sio.to(game.roomName).emit('drawHorizontalArrow', arrowCoords);
        });

        socket.on('powerCardClick', (powerCardName, additionnalParams) => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            const player = game.mapPlayers.get(user.name);
            if (!player) {
                return;
            }
            this.powerCardsService.powerCardsHandler(game, player, powerCardName, additionnalParams);
            // we update the board state
            this.gameUpdateClients(game);
        });

        socket.on('requestLetterReserve', () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const game = this.rooms.get(user.roomName);
            if (!game) {
                return;
            }
            socket.emit('sendLetterReserve', this.letterBankService.getLettersInReserve(game));
        });
    }

    private async createGameAndPlayer(
        gameMode: string,
        timeTurn: number,
        playerName: string,
        socket: io.Socket,
        roomName: string,
        isGamePrivate: boolean,
        passwd: string,
        activatedPowers: boolean[],
    ) {
        // We create the game and add it to the rooms map
        const newGame: GameServer = new GameServer(timeTurn, gameMode, roomName, isGamePrivate, passwd);
        const newPlayer = new Player(playerName, true);
        newPlayer.id = socket.id;
        newPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(playerName));
        this.boardService.initBoardArray(newGame);

        // fill the remaining players with bots
        for (let i = 0; i < Constants.MAX_PERSON_PLAYING - 1; i++) {
            const virtualPlayerId = 'virtualPlayer';
            const newOpponent = new Player(this.databaseService.namesVP[i].firstName + ' ' + this.databaseService.namesVP[i].lastName, false);
            newOpponent.avatarUri = await this.avatarService.getRandomAvatar();
            newOpponent.id = virtualPlayerId;
            newGame.mapPlayers.set(newOpponent.name, newOpponent);
        }

        newGame.mapPlayers.set(newPlayer.name, newPlayer);
        this.rooms.set(roomName, newGame);

        // Joining the room
        socket.join(roomName);

        // activate of desactivate the power cards depending on the settings
        // set by the creator of the game
        if (gameMode === Constants.POWER_CARDS_MODE) {
            this.powerCardsService.initPowerCards(newGame, activatedPowers);

            this.powerCardsService.givePowerToPlayers(newGame);
        }

        // Since this.socketService.sio doesn't work, we made functions to initialize the sio in other services
        this.putLogicService.initSioPutLogic(this.sio);
        this.mouseEventService.initSioMouseEvent(this.sio);
        this.playAreaService.initSioPlayArea(this.sio);
        this.matchmakingService.initSioMatchmaking(this.sio);

        // create button for creator to start the game if enough reel player are in the game
        this.shouldCreatorBeAbleToStartGame(newGame);
    }
    private shouldCreatorBeAbleToStartGame(game: GameServer) {
        let creatorCanStart = true;
        if (game.gameStarted || game.gameFinished) {
            creatorCanStart = false;
        } else {
            const nbRealPlayer = Array.from(game.mapPlayers.values()).filter((player) => player.id !== 'virtualPlayer').length;
            if (nbRealPlayer < Constants.MIN_PERSON_PLAYING) {
                creatorCanStart = false;
            }
        }

        for (const player of game.mapPlayers.values()) {
            if (!player.isCreatorOfGame) {
                continue;
            }
            this.sio.sockets.sockets.get(player.id)?.emit('creatorShouldBeAbleToStartGame', creatorCanStart);
            break;
        }
    }

    private async joinGameAsPlayer(socket: io.Socket, game: GameServer, userData: User) {
        // we add the new player to the map of players
        const newPlayer = new Player(userData.name, false);
        game?.mapPlayers.set(socket.id, newPlayer); // dont delete this even if its duplicate code
        newPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(userData.name));
        newPlayer.id = socket.id;
        game?.mapPlayers.set(socket.id, newPlayer);

        this.playAreaService.sendMsgToAllInRoom(game, userData?.name + ' a rejoint la partie.');
        this.playAreaService.sendMsgToAllInRoom(game, 'La partie commence !');

        // tell the client to his state as a person
        socket.emit('isSpectator', false);
    }

    private joinGameAsSpectator(socket: io.Socket, game: GameServer, userData: User) {
        // we add the new observator to the map of observators
        const newSpectator = new Spectator(userData.name);
        newSpectator.socketId = socket.id;
        game?.mapSpectators.set(socket.id, newSpectator);

        // tell the client to his state as a person
        socket.emit('isSpectator', true);
    }

    private clientAndRoomHandler(socket: io.Socket) {
        socket.on('new-user', (name) => {
            this.users.set(socket.id, { name, roomName: '', elo: 2000 });
        });

        socket.on('createRoomAndGame', async ({ roomName, playerName, timeTurn, gameMode, isGamePrivate, passwd, activatedPowers }) => {
            const roomData = this.rooms.get(roomName);
            if (roomData) {
                socket.emit('messageServer', 'Une salle avec ce nom existe déjà.');
                return;
            }
            // We add the roomName to the userMap
            const user = this.users.get(socket.id);
            if (user) {
                user.roomName = roomName;
            }
            await this.createGameAndPlayer(gameMode, timeTurn, playerName, socket, roomName, isGamePrivate, passwd, activatedPowers);
            const createdGame = this.rooms.get(roomName);
            if (!createdGame) {
                return;
            }

            const players = Array.from(createdGame.mapPlayers.values());
            const spectators = Array.from(createdGame.mapSpectators.values());
            this.sio.sockets.emit('addElementListRoom', {
                roomName,
                gameMode,
                timeTurn,
                passwd,
                players,
                spectators,
            });

            this.gameUpdateClients(createdGame);

            // emit to change page on client after verification
            createdGame.gameStart = new Date().toString();
            socket.emit('roomChangeAccepted', '/game');
        });

        socket.on('joinRoom', (roomName, playerId) => {
            const userData = this.users.get(playerId);
            if (!userData) {
                return;
            }

            if (userData?.roomName === roomName) {
                socket.emit('roomChangeAccepted', '/game');
                return;
            }

            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }

            if (game.isGamePrivate) {
                userData.roomName = game.roomName;
                for (const creatorOfGame of game.mapPlayers.values()) {
                    if (creatorOfGame.isCreatorOfGame) {
                        this.sio.sockets.sockets.get(creatorOfGame.id)?.emit('askForEntrance', userData.name, playerId);
                        return;
                    }
                }
            }

            this.joinRoom(socket, userData, game);
        });

        socket.on('acceptPlayer', (isAccepted, newPlayerId) => {
            const userData = this.users.get(newPlayerId);
            if (!userData) {
                return;
            }

            const game = this.rooms.get(userData.roomName);
            if (!game) {
                return;
            }

            const socketNewPlayer = this.sio.sockets.sockets.get(newPlayerId);
            if (!socketNewPlayer) {
                return;
            }

            if (isAccepted) {
                this.joinRoom(socketNewPlayer, userData, game);
            } else {
                userData.roomName = '';
                this.sio.sockets.sockets.get(newPlayerId)?.emit('messageServer', "Vous n'avez pas été accepté dans la salle.");
            }
        });

        socket.on('listRoom', () => {
            this.sendListOfRooms(socket);
        });

        socket.on('spectWantsToBePlayer', async () => {
            const user = this.users.get(socket.id);
            if (!user) {
                return;
            }
            const roomName = user?.roomName;
            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }
            const spectator = game.mapSpectators.get(socket.id);
            if (!spectator) {
                // enters here for wanting to be spect
                return;
            }
            game.mapSpectators.delete(socket.id);

            let oldVirtualPlayer;
            // take the first virtualPlayer that the server founds
            for (const player of game.mapPlayers.values()) {
                if (player.id === 'virtualPlayer') {
                    oldVirtualPlayer = player;
                    break;
                }
            }
            if (!oldVirtualPlayer) {
                // eslint-disable-next-line no-console
                console.log("Error: virtual player not found in 'spectWantsToBePlayer'");
                return;
            }
            const oldVPName = oldVirtualPlayer.name;
            // delete the old virtual player from the map
            game.mapPlayers.delete(oldVirtualPlayer.name);

            // set the new player attribute and add it to the map
            oldVirtualPlayer.id = socket.id;
            oldVirtualPlayer.name = user.name;
            oldVirtualPlayer.avatarUri = this.userService.getAvatar(await this.userService.findUserByName(user.name));
            game.mapPlayers.set(oldVirtualPlayer.name, oldVirtualPlayer);

            socket.emit('isSpectator', false);

            for (const player of game.mapPlayers.values()) {
                player.chatHistory.push({
                    message: user.name + Constants.REPLACEMENT_BY_PLAYER + oldVPName + '.',
                    isCommand: false,
                    sender: 'S',
                });
            }

            // sending game info to all client to update nbPlayers and nbSpectators
            // in the room
            this.sio.sockets.emit('addElementListRoom', {
                roomName,
                gameMode: game.gameMode,
                timeTurn: game.minutesByTurn,
                passwd: game.passwd,
                players: Array.from(game.mapPlayers.values()),
                spectators: Array.from(game.mapSpectators.values()),
            });

            this.gameUpdateClients(game);
            this.shouldCreatorBeAbleToStartGame(game);
        });

        // called when the creator of a multiplayer game wants to start the game
        socket.on('startGame', (roomName) => {
            // OLD CODE REPLACED BY THE FACT THAT THE CREATOR OF THE GAME STARTS THE GAME
            const game = this.rooms.get(roomName);
            if (!game) {
                return;
            }

            if (game.mapPlayers.size >= Constants.MIN_PERSON_PLAYING && !game.gameStarted) {
                // we give the server bc we can't include socketManager in those childs
                // but it sucks so... TODO: find a better way to do this
                this.putLogicService.initSioPutLogic(this.sio);
                this.playAreaService.initSioPlayArea(this.sio);
                this.mouseEventService.initSioMouseEvent(this.sio);
                this.matchmakingService.initSioMatchmaking(this.sio);

                // we start the game
                this.playAreaService.playGame(game);
                this.sio.to(roomName).emit('setTimeoutTimerStart');
            }
        });

        socket.on('leaveGame', () => {
            this.leaveGame(socket, '');
        });
    }

    private joinRoom(socket: io.Socket, userData: User, game: GameServer): void {
        let isOneNamedSame = false;
        for (const player of game.mapPlayers.values()) {
            if (userData.name === player.name) {
                isOneNamedSame = true;
                break;
            }
        }
        for (const spectator of game.mapSpectators.values()) {
            if (userData.name === spectator.name) {
                isOneNamedSame = true;
                break;
            }
        }

        if (isOneNamedSame) {
            socket.emit(
                'messageServer',
                "Vous avez le même nom qu'un des joueurs déjà dans la salle, veuillez le changer en retournant au menu principal.",
            );
            return;
        }
        if (userData) {
            userData.roomName = game.roomName;
        }

        // Joining the room
        socket.join(game.roomName);

        // if condition respected it means the new user is a player and not a spectator
        // else it is a spectator
        if (game.mapPlayers.size < Constants.MAX_PERSON_PLAYING) {
            this.joinGameAsPlayer(socket, game, userData);
        } else {
            this.joinGameAsSpectator(socket, game, userData);
        }

        // we send the game state to all clients in the room
        this.gameUpdateClients(game);

        // create button for creator to start the game if enough reel player are in the game
        this.shouldCreatorBeAbleToStartGame(game);

        // emit to change page on client after verification
        socket.emit('roomChangeAccepted', '/game');

        // sending game info to all client to update nbPlayers and nbSpectators
        const players = Array.from(game.mapPlayers.values());
        const spectators = Array.from(game.mapSpectators.values());

        this.sio.sockets.emit('addElementListRoom', {
            roomName: game.roomName,
            gameMode: game.gameMode,
            timeTurn: game.minutesByTurn,
            passwd: game.passwd,
            players,
            spectators,
        });
    }

    // update game for all players in the room
    private gameUpdateClients(game: GameServer) {
        // We send to all clients a gameState and a scoreBoardState\
        this.sio.to(game.roomName).emit('gameBoardUpdate', game);

        // //we send to all clients an update of the players and spectators
        this.sio.to(game.roomName).emit('playersSpectatorsUpdate', {
            roomName: game.roomName,
            players: Array.from(game.mapPlayers.values()),
            spectators: Array.from(game.mapSpectators.values()),
        });

        // we send an update of the player object for each respective client
        for (const player of game.mapPlayers.values()) {
            this.sio.sockets.sockets.get(player.id)?.emit('playerAndStandUpdate', player);
        }
    }

    private disconnectAbandonHandler(socket: io.Socket) {
        socket.on('disconnect', () => {
            this.leaveGame(socket, " s'est déconnecté.");
            this.users.delete(socket.id);
        });

        socket.on('giveUpGame', () => {
            this.leaveGame(socket, ' a abandonné la partie.');
        });
    }

    private rankedHandler(socket: io.Socket) {
        socket.on('changeElo', (player) => {
            this.userService.changeEloUser(player);
        });

        socket.on('leaveRankedGame', (player) => {
            player.elo -= 20;
            this.userService.changeEloUser(player);
        });

        socket.on('startMatchmaking', ({ eloDisparity, user }) => {
            console.log('lets gooooo');
            this.matchmakingService.findARoomForPlayer(socket, eloDisparity, user);
            // socket.emit('matchFound', player);
        });

        socket.on('refuseMatch', ({ user }) => {
            this.matchmakingService.onRefuse(socket, user);
        });

        socket.on('acceptMatch', ({ user }) => {
            this.matchmakingService.onAccept(socket, user);
        });
    }

    private leaveGame(socket: io.Socket, leaveMsg: string) {
        const user = this.users.get(socket.id);
        if (!user) {
            return;
        }
        const game = this.rooms.get(user.roomName);
        if (!game) {
            return;
        }
        if (game.gameFinished) {
            this.sio.sockets.emit('gameOver');
            return;
        }

        const playerThatLeaves = game.mapPlayers.get(user.name);
        const specThatLeaves = game.mapSpectators.get(socket.id);
        // if it is a spectator that leaves
        if (playerThatLeaves) {
            // if there are only virtualPlayers in the game we delete the game
            const nbRealPlayer = Array.from(game.mapPlayers.values()).filter(
                (player) => player.id !== 'virtualPlayer' && player.id !== playerThatLeaves?.id,
            ).length;
            const nbSpectators = game.mapSpectators.size;

            if (nbRealPlayer >= 1 || nbSpectators >= 1) {
                // we send to the opponent a update of the game
                const waitBeforeAbandonment = 3000;
                setTimeout(async () => {
                    await this.playAreaService.replaceHumanByBot(playerThatLeaves, game, leaveMsg);
                    if (socket.id === game.masterTimer) {
                        game.setMasterTimer();
                    }
                    if (playerThatLeaves.isCreatorOfGame) {
                        playerThatLeaves.isCreatorOfGame = !playerThatLeaves.isCreatorOfGame;
                        game.setNewCreatorOfGame();
                    }
                    this.gameUpdateClients(game);

                    // if the game hasn't started we check if the button start game should be present
                    if (!game.gameStarted) {
                        this.shouldCreatorBeAbleToStartGame(game);
                    }

                    // check if we should delete the room game or not
                    this.gameFinishedAction(game);
                }, waitBeforeAbandonment);
            } else {
                // we remove the player leaving in the map
                game.mapPlayers.delete(playerThatLeaves.name);
                // we decide if we delete the room or not
                this.gameFinishedAction(game);
            }
        } else if (specThatLeaves) {
            // if it is a spectator that leaves
            game.mapSpectators.delete(socket.id);
            // we check if we should delete the game or not
            this.gameFinishedAction(game);
        } else {
            // should never go there
            // eslint-disable-next-line no-console
            console.log('Game is broken in socketManager::leaveGame. Good luck to u who got this error :)');
        }

        socket.leave(user.roomName);
        user.roomName = '';
        this.gameUpdateClients(game);
    }
    private gameFinishedAction(game: GameServer) {
        const nbRealPlayer = Array.from(game.mapPlayers.values()).filter((player) => player.id !== 'virtualPlayer').length;
        const nbSpectators = game?.mapSpectators.size;
        // if this is the last player to leave the room we delete it
        if (nbRealPlayer + nbSpectators < 1) {
            this.rooms.delete(game.roomName);
            this.sio.sockets.emit('removeElementListRoom', game.roomName);
        }
    }

    private sendListOfRooms(socket: io.Socket) {
        for (const roomName of this.rooms.keys()) {
            const game = this.rooms.get(roomName);
            if (!game || game?.gameFinished) {
                continue;
            }

            socket.emit('addElementListRoom', {
                roomName,
                gameMode: game.gameMode,
                timeTurn: game.minutesByTurn,
                passwd: game.passwd,
                players: Array.from(game.mapPlayers.values()),
                spectators: Array.from(game.mapSpectators.values()),
            });
        }
    }
    private commBoxInputHandler(socket: io.Socket) {
        socket.on('newMessageClient', (inputClient) => {
            this.manageNewMessageClient(inputClient, socket);
        });

        socket.on('chat msg', (chat: ChatMessage) => {
            this.chatHistory.push(chat);
            socket.broadcast.emit('chat msg', chat);
        });
    }

    private triggerStopTimer(roomName: string) {
        this.sio.to(roomName).emit('stopTimer');
        this.sio.to(roomName).emit('displayChangeEndGame', Constants.END_GAME_DISPLAY_MSG);
    }

    private adminHandler(socket: io.Socket) {
        socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);

        socket.on('DictionaryUploaded', async () => {
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('DeleteVPName', async (vpName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.deleteNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('DeleteExpertVPName', async (vpName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.deleteNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });

        socket.on('RefreshBothDbs', async () => {
            await this.databaseService.resetDatabase();
            await this.databaseService.updateDBNames();
            await this.databaseService.updateDBDict();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('AddBeginnerNameVP', async (vpName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.addNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('AddExpertNameVP', async (vpName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.addNameVP(vpName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });

        socket.on('deleteSelectedDictionary', async (dictionary: MockDict) => {
            await this.databaseService.dictionariesCollection.deleteDictionary(dictionary.title);
            await this.databaseService.updateDBDict();
            this.sio.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
            const message = 'Le dictionaire ' + dictionary.title + ' a été supprimé !';
            this.sio.emit('DictionaryDeletedMessage', message);
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('EditDictionary', async (dictionary: MockDict, formerTitle: string) => {
            await this.databaseService.dictionariesCollection.modifyDictionary(dictionary, formerTitle);
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('AddDictionary', async (dictionary: DictJSON) => {
            await this.databaseService.dictionariesCollection.addDictionary(dictionary);
            await this.databaseService.updateDBDict();
            socket.emit('SendDictionariesToClient', this.databaseService.dictionariesMock);
        });

        socket.on('EditBeginnerNameVP', async (vpName: NameVP, formerVPName: NameVP) => {
            await this.databaseService.beginnerVPNamesCollections.editNameVP(vpName, formerVPName);
            await this.databaseService.updateDBNames();
            socket.emit('SendBeginnerVPNamesToClient', this.databaseService.namesVP);
        });

        socket.on('EditExpertNameVP', async (vpName: NameVP, formerVPName: NameVP) => {
            await this.databaseService.expertVPNamesCollection.editNameVP(vpName, formerVPName);
            await this.databaseService.updateDBNames();
            socket.emit('SendExpertVPNamesToClient', this.databaseService.namesVPExpert);
        });
    }

    private searchHandler(socket: io.Socket) {
        const MAX_USERS = 5;
        socket.on('getPlayerNames', async (data) => {
            const usersFound = await this.userService.users
                .find({
                    name: {
                        $regex: data,
                        $options: 'i',
                    },
                })
                .select('name')
                .limit(MAX_USERS);
            socket.emit('getPlayerNames', usersFound);
        });
    }
}
