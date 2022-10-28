import 'dart:core';
import 'package:client_leger/constants/constants_test.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/trie.dart';
import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/models/vec4.dart';

import 'letter-data.dart';
import 'letter.dart';

class GameServer {

  // LETTER BANK SERVICE DATA
  late Map<String, LetterData> letterBank;
  late List<String> letters;

  late String roomName;
  late String gameStart;

  // BOARD SERVICE DATA
  late List<List<Tile>> board;
  late Trie trie;

  // we are obliged to put the esLint disable because the object class we use isnt stable
  // we therefore need to use any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  late Map<String, dynamic> mapLetterOnBoard;

  late List<List<String>> bonusBoard;
  late List<String> bonuses;

  // EQUIVALENT STAND PLAYER SERVICE DATA
  late Map<String, Player> mapPlayers;
  late Map<String, Spectator> mapSpectators;
  late List<Player> winners;

  // VALIDATION SERVICE
  late bool noTileOnBoard;

  // GAME PARAMETERS SERVICE DATA
  late bool randomBonusesOn;
  late String gameMode;
  late num minutesByTurn;
  late bool isGamePrivate;
  late String passwd;

  // PLAY AREA SERVICE DATA
  late num nbLetterReserve;
  late bool gameStarted;
  late bool gameFinished;
  late num idxPlayerPlaying;
  late String masterTimer;

  // SKIP TURN SERVICE DATA
  late String displaySkipTurn;

  late String vpLevel;

  GameServer(
      {required this.minutesByTurn, required this.randomBonusesOn, required this.gameMode, required this.vpLevel, required this.roomName, required this.isGamePrivate, required this.passwd}) {
    trie = Trie();
    letters = [];
    board = [];
    mapLetterOnBoard = {};
    mapPlayers = {};
    mapSpectators = {};
    nbLetterReserve = 88;
    gameStarted = false;
    gameFinished = false;
    idxPlayerPlaying = -1;
    masterTimer = '';
    displaySkipTurn = "En attente d'un autre joueur..";
    noTileOnBoard = true;
    winners = List.from([Player('', false)]);

    bonusBoard = constBoard1;

    letterBank = {
      'A': LetterData(quantity: 9, weight: 1),
      'B': LetterData(quantity: 2, weight: 3),
      'C': LetterData(quantity: 2, weight: 3),
      'D': LetterData(quantity: 3, weight: 2),
      'E': LetterData(quantity: 15, weight: 1),
      'F': LetterData(quantity: 2, weight: 4),
      'G': LetterData(quantity: 2, weight: 2),
      'H': LetterData(quantity: 2, weight: 4),
      'I': LetterData(quantity: 8, weight: 8),
      'J': LetterData(quantity: 1, weight: 8),
      'K': LetterData(quantity: 1, weight: 10),
      'L': LetterData(quantity: 5, weight: 1),
      'M': LetterData(quantity: 3, weight: 2),
      'N': LetterData(quantity: 6, weight: 1),
      'O': LetterData(quantity: 6, weight: 1),
      'P': LetterData(quantity: 2, weight: 3),
      'Q': LetterData(quantity: 1, weight: 8),
      'R': LetterData(quantity: 6, weight: 1),
      'S': LetterData(quantity: 6, weight: 1),
      'T': LetterData(quantity: 6, weight: 1),
      'U': LetterData(quantity: 6, weight: 1),
      'V': LetterData(quantity: 2, weight: 4),
      'W': LetterData(quantity: 1, weight: 10),
      'X': LetterData(quantity: 1, weight: 10),
      'Y': LetterData(quantity: 1, weight: 10),
      'Z': LetterData(quantity: 1, weight: 10),
      '*': LetterData(quantity: 2, weight: 0),
    };

    initializeLettersArray();
    initializeBonusBoard();
    initBoardArray();

  }

  GameServer.fromJson(game){
    minutesByTurn = game["minutesByTurn"];
    randomBonusesOn = game["randomBonusesOn"];
    gameMode = game["gameMode"];
    vpLevel = game["vpLevel"];
    //TODO Trie
    letters = List<String>.from(game["letters"]);

    board = [];
    bonusBoard = [];
    var lines = game["board"];
    for(var line in lines){
      List<Tile> tempLine = [];
      for(var tile in line){
        tempLine.add(Tile.fromJson(tile));
      }
      board.add(tempLine);
    }

    roomName = game["roomName"];
    //TODO mapLetterOnBoard
    //TODO mapPlayers
    //TODO mapSpectators
    nbLetterReserve = game["nbLetterReserve"];
    gameStarted = game["gameStarted"];
    gameFinished = game["gameFinished"];
    idxPlayerPlaying = game["idxPlayerPlaying"];
    masterTimer = game["masterTimer"];
    displaySkipTurn = game["displaySkipTurn"];
    noTileOnBoard = game["noTileOnBoard"];
    //TODO winners
    //TODO letterBank

    bonusBoard = [];
    var bonusLines = game["bonusBoard"];
    for(var bonusLine in bonusLines){
      List<String> tempLine = [];
      for(var bonus in bonusLine){
        tempLine.add(bonus);
      }
      bonusBoard.add(tempLine);
    }

  }

  initializeLettersArray() {
    letters = [];

    for(var key in letterBank.keys) {
      var letterData = letterBank[key]?.quantity;
      if(letterData != null){
        for(var i = 0; i < letterData; i++) {
          letters.add(key);
        }
      }
    }
  }

  initializeBonusBoard() {
    List<String> row1 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row2 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row3 = List.from(['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx']);
    List<String> row4 = List.from(['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx']);
    List<String> row5 = List.from(['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx']);
    List<String> row6 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row7 = List.from(['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx']);
    List<String> row8 = List.from(['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx']);
    List<String> row9 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row10 = List.from(['xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx']);
    List<String> row11 = List.from(['xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx']);
    List<String> row12 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'xx', 'xx']);
    List<String> row13 = List.from(['xx', 'letterx2', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'letterx2', 'xx'],);
    List<String> row14 = List.from(['xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx', 'xx']);
    List<String> row15 = List.from(['xx', 'xx', 'wordx2', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'letterx3', 'xx', 'xx', 'xx', 'wordx2', 'xx', 'xx']);
    List<String> row16 = List.from(['xx', 'wordx3', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'xx', 'wordx3', 'xx', 'xx', 'xx', 'letterx2', 'xx', 'xx', 'wordx3', 'xx']);
    List<String> row17 = List.from(['xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx', 'xx']);

    bonusBoard = List.from([row1, row2, row3, row4, row5, row6, row7, row8, row9, row10, row11, row12, row13, row14, row15, row16, row17]);
  }

  initBoardArray() {
    for(int i = 0; i < NUMBER_SQUARE_H_AND_W + 2; i++) {
      board.add([]);
      for(int j = 0; j < NUMBER_SQUARE_H_AND_W + 2; j++) {
        Tile newTile = Tile();
        Letter newLetter = Letter();

        newLetter.weight = 0;
        newLetter.value = '';

        newTile.letter = newLetter;
        newTile.bonus = bonusBoard[i][j];

        board[i].add(newTile);
      }
    }
  }
}
