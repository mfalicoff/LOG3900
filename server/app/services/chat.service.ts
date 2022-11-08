/* eslint-disable @typescript-eslint/no-magic-numbers */
import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { ValidationService } from '@app/services/validation.service';
import { Service } from 'typedi';
import UserService from '@app/services/user.service';
import { EndGameService } from '@app/services/end-game.service';
import { DEFAULT_VALUE_NUMBER } from '@app/classes/global-constants';

enum Commands {
    Place = '!placer',
    Exchange = '!échanger',
    Pass = '!passer',
    Debug = '!debug',
    Help = '!aide',
    Reserve = '!reserve',
}

@Service()
export class ChatService {
    passInARowGlobal = 12;
    constructor(public validator: ValidationService, private endGameService: EndGameService, private userService: UserService) {}

    // verify if a command is entered and redirect to corresponding function
    async sendMessage(input: string, game: GameServer, player: Player): Promise<boolean> {
        const command: string = input.split(' ', 1)[0];
        if (input[0] === '!') {
            if (game.gameFinished) {
                this.pushMsgToAllPlayers(game, player.name, GlobalConstants.GAME_IS_OVER, true, 'S');
                return false;
            }
            const isActionCommand: boolean = command === Commands.Place || command === Commands.Exchange || command === Commands.Pass;
            const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
            if (isActionCommand && !(player.id === playerPlaying.id)) {
                player.chatHistory.push({ message: 'You ' + ' : ' + input, isCommand: true, sender: 'P' });
                player.chatHistory.push({ message: GlobalConstants.NOT_YOUR_TURN, isCommand: false, sender: 'S' });
                return false;
            }
            // verify that the command is valid
            if (!this.validator.isCommandValid(input)) {
                player.chatHistory.push({ message: GlobalConstants.INVALID_ENTRY, isCommand: false, sender: 'S' });
                return false;
            }
            // verify the syntax
            const syntaxError = this.validator.syntaxIsValid(input, game, player);
            if (syntaxError !== '') {
                player.chatHistory.push({ message: GlobalConstants.INVALID_SYNTAX + syntaxError, isCommand: false, sender: 'S' });
                return false;
            }

            if (command === Commands.Place) {
                const graphicsError = this.validator.verifyPlacementOnBoard(input.split(' ', 3), game);
                if (graphicsError !== '') {
                    player.chatHistory.push({ message: GlobalConstants.UNABLE_TO_PROCESS_COMMAND + graphicsError, isCommand: true, sender: 'S' });
                    return false;
                }
            }
            await this.commandFilter(input, game, player);
            return true;
        }
        if (this.validator.entryIsTooLong(input)) {
            // verify the length of the command
            player.chatHistory.push({ message: GlobalConstants.INVALID_LENGTH, isCommand: false, sender: 'S' });
            return false;
        }

        this.pushMsgToAllPlayers(game, player.name, input, false, 'P');

        return true;
    }

    printReserveStatus(game: GameServer, player: Player) {
        for (const key of game.letterBank.keys()) {
            const letterData = game.letterBank.get(key);
            player.chatHistory.push({ message: key + ' : ' + letterData?.quantity, isCommand: false, sender: 'S' });
        }
    }

    async placeCommand(input: string, game: GameServer, player: Player) {
        player.passInARow = 0;
        this.passInARowGlobal = 0;
        if (this.validator.reserveIsEmpty(game.letterBank) && this.validator.standEmpty(player)) {
            this.pushMsgToAllPlayers(game, player.name, 'Fin de la partie !', false, 'S');
            await this.showEndGameStats(game /* , player*/);
            game.gameFinished = true;
            return;
        }
        this.pushMsgToAllPlayers(game, player.name, input, true, 'P');
        player.chatHistory.push({ message: GlobalConstants.PLACE_CMD, isCommand: false, sender: 'S' });
    }

    // function to pass turn
    async passCommand(input: string, game: GameServer, player: Player) {
        player.passInARow++;
        this.passInARowGlobal++;
        this.pushMsgToAllPlayers(game, player.name, input, true, 'P');
        player.chatHistory.push({ message: GlobalConstants.PASS_CMD, isCommand: false, sender: 'S' });
        if (this.passInARowGlobal === 12) {
            this.pushMsgToAllPlayers(game, player.name, 'Fin de la partie !', false, 'S');
            await this.showEndGameStats(game /* , player*/);
            game.gameFinished = true;
            return;
        }
    }

    // functions that psuh to chatHistory the msg to all players in the game
    // then the chatHistory is sent to the client each time a player send a message
    // TODO REFACTORING messageSender and command are too much we only need one of them
    pushMsgToAllPlayers(game: GameServer, playerSendingMsg: string, msg: string, command: boolean, messageSender: string) {
        game.mapPlayers.forEach((player) => {
            if (messageSender !== 'S') {
                if (player.name === playerSendingMsg) {
                    messageSender = 'P';
                } else {
                    messageSender = 'O';
                }
                player.chatHistory.push({ message: playerSendingMsg + ': ' + msg, isCommand: command, sender: messageSender });
            } else {
                player.chatHistory.push({ message: msg, isCommand: command, sender: messageSender });
            }
        });

        game.mapSpectators.forEach((spectator) => {
            if (messageSender !== 'S') {
                spectator.chatHistory.push({ message: playerSendingMsg + ': ' + msg, isCommand: command, sender: 'O' });
            } else {
                spectator.chatHistory.push({ message: msg, isCommand: command, sender: messageSender });
            }
        });
    }

    // filter the command to call the correct function
    private async commandFilter(input: string, game: GameServer, player: Player): Promise<void> {
        const command = input.split(' ', 1)[0];
        switch (command) {
            case Commands.Place:
                await this.placeCommand(input, game, player);
                break;
            case Commands.Exchange:
                this.exchangeCommand(input, game, player);
                break;
            case Commands.Pass:
                await this.passCommand(input, game, player);
                break;
            case Commands.Debug:
                this.debugCommand(input, player, game);
                break;
            case Commands.Help:
                this.helpCommand(input, player);
                break;
            case Commands.Reserve:
                this.reserveCommand(input, player);
                break;
        }
    }

    private exchangeCommand(input: string, game: GameServer, player: Player) {
        player.passInARow = 0;
        this.passInARowGlobal = 0;
        this.pushMsgToAllPlayers(game, player.name, input, true, 'P');
        player.chatHistory.push({ message: GlobalConstants.EXCHANGE_PLAYER_CMD, isCommand: false, sender: 'S' });
    }

    // function that shows the reserve
    private reserveCommand(input: string, player: Player) {
        if (player.debugOn) {
            player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
            player.chatHistory.push({ message: GlobalConstants.RESERVE_CMD, isCommand: false, sender: 'S' });
        } else {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_NOT_ACTIVATED, isCommand: false, sender: 'S' });
        }
    }

    // function that shows the help command
    private helpCommand(input: string, player: Player) {
        player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_PLACE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_PASS, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_EXCHANGE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_RESERVE, isCommand: false, sender: 'S' });
        player.chatHistory.push({ message: GlobalConstants.CMD_HELP_TEXT_DEBUG, isCommand: false, sender: 'S' });
    }

    private debugCommand(input: string, player: Player, game: GameServer) {
        for (const playerElem of game.mapPlayers.values()) {
            if (playerElem.id === 'virtualPlayer') {
                playerElem.debugOn = !playerElem.debugOn;
            }
        }

        player.chatHistory.push({ message: input, isCommand: true, sender: 'P' });
        if (player.debugOn) {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_CMD_ON, isCommand: false, sender: 'S' });
        } else {
            player.chatHistory.push({ message: GlobalConstants.DEBUG_CMD_OFF, isCommand: false, sender: 'S' });
        }
    }

    private async showEndGameStats(game: GameServer /* , player: Player*/) {
        game.endTime = new Date().getTime();
        let playersCpy: Player[] = Array.from(game.mapPlayers.values());
        playersCpy = [...new Set(playersCpy)];
        for (const playerElem of playersCpy) {
            this.pushMsgToAllPlayers(
                game,
                playerElem.name,
                playerElem.name + ' : ' + this.endGameService.listLetterStillOnStand(playerElem),
                false,
                'S',
            );
            const gameLength = game.endTime - game.startTime;
            await this.userService.updateStatsAtEndOfGame(gameLength, playerElem);
        }
        await this.sendWinnerMessage(game, this.endGameService.chooseWinner(game, playersCpy));
    }

    private async sendWinnerMessage(game: GameServer, winners: Player[]) {
        let playersCpy: Player[] = Array.from(game.mapPlayers.values());
        // eslint-disable-next-line no-unused-vars
        playersCpy = [...new Set(playersCpy)];
        if (winners.length === 1) {
            this.pushMsgToAllPlayers(
                game,
                winners[0].name,
                GlobalConstants.WINNER_MSG_PT1 + winners[0].name + GlobalConstants.WINNER_MSG_PT2 + winners[0].score,
                false,
                'S',
            );
            await this.userService.updateWinHistory(winners[0]);
        } else if (winners.length > 1) {
            this.pushMsgToAllPlayers(game, '', GlobalConstants.DRAW_MSG, false, 'S');

            for (const winner of winners) {
                this.pushMsgToAllPlayers(game, '', 'Score final pour: ' + winner.name + ' est: ' + winner.score, false, 'S');
                await this.userService.updateWinHistory(winner);
            }
        } else {
            this.pushMsgToAllPlayers(game, '', GlobalConstants.GAME_NOT_UNDERSTOOD, false, 'S');
        }
        const winnerNames = winners.map((winner) => winner.name);
        for (const playerElem of game.mapPlayers.values()) {
            if (winnerNames.indexOf(playerElem.name) === DEFAULT_VALUE_NUMBER)
                await this.userService.updateGameHistory(playerElem, false, game.startTime);
            else await this.userService.updateGameHistory(playerElem, true, game.startTime);
        }
    }
}
