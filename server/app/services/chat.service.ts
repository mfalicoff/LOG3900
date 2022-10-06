import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Player } from '@app/classes/player';
import { EndGameService } from '@app/services/end-game.service';
import { ValidationService } from '@app/services/validation.service';
import { Service } from 'typedi';

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
    constructor(public validator: ValidationService, private endGameService: EndGameService) {}

    // verify if a command is entered and redirect to corresponding function
    sendMessage(input: string, game: GameServer, player: Player): boolean {
        const command: string = input.split(' ', 1)[0];
        if (input[0] === '!') {
            if (game.gameFinished) {
                this.pushMsgToAllPlayers(game, player.name, GlobalConstants.GAME_IS_OVER, true, 'S');
                return false;
            }
            const isActionCommand: boolean = command === Commands.Place || command === Commands.Exchange || command === Commands.Pass;
            const playerPlaying = Array.from(game.mapPlayers.values())[game.idxPlayerPlaying];
            if (isActionCommand && !(player.idPlayer === playerPlaying.idPlayer)) {
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
                const graphicsError = this.validator.verifyPlacementOnBoard(input.split(' ', 3), game, player);
                if (graphicsError !== '') {
                    player.chatHistory.push({ message: GlobalConstants.UNABLE_TO_PROCESS_COMMAND + graphicsError, isCommand: true, sender: 'S' });
                    return false;
                }
            }
            this.commandFilter(input, game, player);
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

    placeCommand(input: string, game: GameServer, player: Player) {
        player.passInARow = 0;

        this.pushMsgToAllPlayers(game, player.name, input, true, 'P');
        player.chatHistory.push({ message: GlobalConstants.PLACE_CMD, isCommand: false, sender: 'S' });

        if (this.validator.reserveIsEmpty(game.letterBank) && this.validator.standEmpty(player)) {
            this.showEndGameStats(game, player, false);
            game.gameFinished = true;
        }
    }

    // function to pass turn
    passCommand(input: string, game: GameServer, player: Player) {
        player.passInARow++;
        this.pushMsgToAllPlayers(game, player.name, input, true, 'P');
        player.chatHistory.push({ message: GlobalConstants.PASS_CMD, isCommand: false, sender: 'S' });

        let didEveryonePass3Times = false;
        for (const playerElem of game.mapPlayers.values()) {
            if (playerElem.passInARow < 3) {
                didEveryonePass3Times = false;
                break;
            } else {
                didEveryonePass3Times = true;
            }
        }
        if (didEveryonePass3Times) {
            this.showEndGameStats(game, player, false);
            game.gameFinished = true;
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
    private commandFilter(input: string, game: GameServer, player: Player): void {
        const command = input.split(' ', 1)[0];
        switch (command) {
            case Commands.Place:
                this.placeCommand(input, game, player);
                break;
            case Commands.Exchange:
                this.exchangeCommand(input, game, player);
                break;
            case Commands.Pass:
                this.passCommand(input, game, player);
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
            if (playerElem.idPlayer === 'virtualPlayer') {
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

    private showEndGameStats(game: GameServer, player: Player, gameAbandoned: boolean) {
        this.pushMsgToAllPlayers(game, player.name, GlobalConstants.END_OF_GAME, false, 'S');
        for (const playerElem of game.mapPlayers.values()) {
            this.pushMsgToAllPlayers(
                game,
                playerElem.name,
                playerElem.name + ' : ' + this.endGameService.listLetterStillOnStand(playerElem),
                false,
                'S',
            );
        }

        if (!gameAbandoned) {
            this.sendWinnerMessage(game, player);
        }
    }

    private sendWinnerMessage(game: GameServer, player: Player) {
        const winners = this.endGameService.chooseWinner(game);
        if (winners.length === 1) {
            this.pushMsgToAllPlayers(
                game,
                player.name,
                GlobalConstants.WINNER_MSG_PT1 + winners[0].name + GlobalConstants.WINNER_MSG_PT2 + winners[0].score,
                false,
                'S',
            );
        } else if (winners.length > 1) {
            this.pushMsgToAllPlayers(game, player.name, GlobalConstants.DRAW_MSG, false, 'S');

            for (const winner of winners) {
                this.pushMsgToAllPlayers(game, player.name, 'Score final pour: ' + winner.name + ' est: ' + winner.score, false, 'S');
            }
        } else {
            this.pushMsgToAllPlayers(game, player.name, GlobalConstants.GAME_NOT_UNDERSTOOD, false, 'S');
        }
    }
}
