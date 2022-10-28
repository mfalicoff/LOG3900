import 'dart:core';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/models/tile.dart';
import 'package:client_leger/models/trie.dart';

import 'letter-data.dart';

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
    bonusBoard = [
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","wordx3","wordx3","wordx3","wordx3","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
      ["xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx","xx"],
    ];
  }

  initBoardArray() {

  }
}
