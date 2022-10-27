import 'package:client_leger/models/tile.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/game-server.dart';
import '../models/game.dart';
import '../models/letter.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/vec4.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  GameServer game = GameServer(minutesByTurn: 0, randomBonusesOn: false, gameMode: 'Solo', vpLevel: 'defaultLevel', roomName: 'defaultRoom', isGamePrivate: false, passwd: '' );

  Player player = Player('DefaultPlayerObject', false);

  //TODO remove these lines later
  //tmp stand for testing
  List<Tile> stand = [];

  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;

  late List<RoomData> rooms = [];
  late RoomData actualRoom;

  String playerName = 'DefaultPlayerName';



  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal() {
    actualRoom = RoomData(name: 'default', timeTurn: '1', isBonusRandom: false, passwd: 'fake', players: [], spectators: []);
    initStand();
    print(stand);
  }

  //tmp function to initialize the stand
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
    newPosition.x1 = j + PADDING_BOARD_FOR_STANDS + WIDTH_HEIGHT_BOARD / 2 - WIDTH_STAND / 2;
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

}
