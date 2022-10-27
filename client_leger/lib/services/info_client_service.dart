import 'package:flutter/material.dart';

import '../models/game.dart';
import '../models/player.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  Game game = Game();
  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;



  Player player = Player();

  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal();

}
