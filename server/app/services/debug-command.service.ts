import { GameServer } from '@app/classes/game-server';
import * as GlobalConstants from '@app/classes/global-constants';
import { Move } from '@app/classes/move';
import { Player } from '@app/classes/player';
import { Service } from 'typedi';

@Service()
export class DebugCommandService {
    setDebugOutputs(moveToPlay: Move, game: GameServer) {
        const position = moveToPlay.command;
        const letterWay: string = position.slice(GlobalConstants.POSITION_LAST_LETTER);
        const indexLine: number =
            position.slice(0, GlobalConstants.END_POSITION_INDEX_LINE).toLowerCase().charCodeAt(0) - GlobalConstants.ASCII_CODE_SHIFT;
        const indexColumn = Number(position.slice(GlobalConstants.END_POSITION_INDEX_LINE, position.length + GlobalConstants.POSITION_LAST_LETTER));
        const wordLength = moveToPlay.word.length;

        const debugOutputs = [];

        if (letterWay === 'h') {
            for (let i = indexColumn; i < indexColumn + wordLength; i++) {
                const indexReadWord = i - indexColumn;
                if (!game.board[indexLine][i].old) {
                    let debugOutput = '';
                    const asciiCodeShift = 96;
                    debugOutput += String.fromCharCode(indexLine + asciiCodeShift) + i.toString();
                    debugOutput += ':' + moveToPlay.word[indexReadWord];
                    debugOutputs.push(debugOutput);
                }
            }
        } else {
            for (let i = indexLine; i < indexLine + wordLength; i++) {
                const indexReadWord = i - indexLine;
                if (!game.board[i][indexColumn].old) {
                    let debugOutput = '';
                    const asciiCodeShift = 96;
                    debugOutput += String.fromCharCode(i + asciiCodeShift) + indexColumn.toString();
                    debugOutput += ':' + moveToPlay.word[indexReadWord];
                    debugOutputs.push(debugOutput);
                }
            }
        }
        return debugOutputs;
    }

    /*
    * this function push the debug msg in the player's output
    * TODO make !debug command only accesible to admin accounts ?
    */
    debugPrint(player: Player, moveToPlay: Move, game: GameServer) {
        if (!player.debugOn || !moveToPlay) {
            return;
        }

        const debugOutputs = this.setDebugOutputs(moveToPlay, game);

        let message = '';
        for (const msg of debugOutputs) {
            message += msg + ' ';
        }

        for(const playerElem of game.mapPlayers.values()){
            if(playerElem.idPlayer === "virtualPlayer"){
                continue;
            }
            playerElem.chatHistory.push({ message: message + '(' + moveToPlay.score + ')', isCommand: false, sender: 'O' });
            for (const wordTiles of moveToPlay.crossWords) {
                let wordString = '';
                wordTiles.words.forEach((tile) => {
                    wordString += tile.letter.value;
                });
                playerElem.chatHistory.push({ message: wordString + ' (' + wordTiles.score + ')', isCommand: false, sender: 'O' });
            }
        }
    }
}
