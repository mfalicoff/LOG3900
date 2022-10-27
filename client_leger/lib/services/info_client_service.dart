import 'package:flutter/material.dart';

import '../models/game.dart';
import '../models/player.dart';
import '../models/room-data.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  Game game = Game();
  Player player = Player();

  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;


  late RoomData actualRoom;


  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal() {
    actualRoom = RoomData(name: 'default', timeTurn: '1', isBonusRandom: false, passwd: 'fake', players: [], spectators: []);
  }

}
