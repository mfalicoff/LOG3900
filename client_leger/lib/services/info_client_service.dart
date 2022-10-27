import 'package:flutter/material.dart';

import '../models/game-server.dart';
import '../models/game.dart';
import '../models/player.dart';
import '../models/room-data.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  GameServer game = GameServer(minutesByTurn: 0, randomBonusesOn: false, gameMode: 'Solo', vpLevel: 'defaultLevel', roomName: 'defaultRoom', isGamePrivate: false, passwd: '' );

  Player player = Player('DefaultPlayerObject', false);

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
  }

}
