import 'package:client_leger/models/tile.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/game-server.dart';
import '../models/letter.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/vec4.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  late GameServer game;

  Player player = Player('DefaultPlayerObject', false);

  //TODO remove these lines later
  //tmp stand for testing
  List<Tile> stand = [];

  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;

  late List<RoomData> rooms = [];
  late RoomData actualRoom;

  String playerName = 'DefaultPlayerName';

  String displayTurn = "En attente d'un autre joueur...";
  bool isTurnOurs = false;

  String gameMode = CLASSIC_MODE;

  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal() {
    actualRoom = RoomData(name: 'default', gameMode: 'classic', timeTurn: '1', passwd: 'fake', players: [], spectators: []);
    game = GameServer(minutesByTurn: 0, gameMode: 'Solo', roomName: 'defaultRoom', isGamePrivate: false, passwd: '' );
    initStand();
  }

  //tmp function to initialize the stand
  //DO NOT REUSE IT
  void initStand(){
    const letterInit = 'abcdefg';
    const nbOccupiedSquare = 7;
    for (
    double i = 0, j = SIZE_OUTER_BORDER_STAND;
    i < NUMBER_SLOT_STAND;
    i++, j += WIDTH_EACH_SQUARE + WIDTH_LINE_BLOCKS
    ) {
      Vec4 newPosition = Vec4();
      Tile newTile = Tile();
      Letter newLetter = Letter();

      // Initialising the position
      newPosition.x1 = j + PADDING_BOARD_FOR_STANDS + WIDTH_HEIGHT_BOARD / 2 -
          WIDTH_STAND / 2;
      newPosition.y1 =
          PADDING_BET_BOARD_AND_STAND +
              SIZE_OUTER_BORDER_STAND +
              PADDING_BOARD_FOR_STANDS +
              WIDTH_HEIGHT_BOARD;
      newPosition.width = WIDTH_EACH_SQUARE;
      newPosition.height = WIDTH_EACH_SQUARE;
      newTile.position = newPosition;

      // Fills the occupiedSquare
      if (i < nbOccupiedSquare) {
        newLetter.weight = 1;
        newLetter.value = letterInit[i.toInt()];

        newTile.letter = newLetter;
        newTile.bonus = '0';

        stand.add(newTile);
      }
      // Fills the rest
      else {
        newLetter.weight = 0;
        newLetter.value = '';

        newTile.letter = newLetter;
        newTile.bonus = '0';

        stand.add(newTile);
      }
    }
  }

  //tmp function to initialize the board
  //DO NOT REUSE IT
  void initBoard() {
    print("hello");
    for (
    double i = 0,
        l =
            SIZE_OUTER_BORDER_BOARD -
                WIDTH_EACH_SQUARE -
                WIDTH_LINE_BLOCKS +
                PADDING_BOARD_FOR_STANDS;
    i < NB_SQUARE_H_AND_W + 2;
    i++, l += WIDTH_EACH_SQUARE + WIDTH_LINE_BLOCKS
    ) {
      game.board[i.toInt()] = [];
      for (
      double j = 0,
          k =
              SIZE_OUTER_BORDER_BOARD -
                  WIDTH_EACH_SQUARE -
                  WIDTH_LINE_BLOCKS +
                  PADDING_BOARD_FOR_STANDS;
      j < NB_SQUARE_H_AND_W + 2;
      j++, k += WIDTH_EACH_SQUARE + WIDTH_LINE_BLOCKS
      ) {
        Tile newTile = Tile();
        Vec4 newPosition = Vec4();
        Letter newLetter = Letter();

        newPosition.x1 = k;
        newPosition.y1 = l;
        newPosition.width = WIDTH_EACH_SQUARE;
        newPosition.height = WIDTH_EACH_SQUARE;

        newLetter.weight = 0;
        newLetter.value = '';

        newTile.letter = newLetter;
        newTile.position = newPosition;
        newTile.bonus = game.bonusBoard[i.toInt()][j.toInt()];

        game.board[i.toInt()].add(newTile);
      }
    }
  }

  void updatePlayer(player){
    player = Player.fromJson(player);
    notifyListeners();
  }

  void updateGame(data){
    game = GameServer.fromJson(data);
    notifyListeners();
  }

}