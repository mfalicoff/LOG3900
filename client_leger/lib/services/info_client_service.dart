import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';

import '../models/game.dart';
import '../models/player.dart';

class InfoClientService extends ChangeNotifier{

  static final InfoClientService _gameService = InfoClientService._internal();

  SocketService socketService = SocketService();
  Game game = Game();

  Player player = Player();

  factory InfoClientService(){
    return _gameService;
  }

  InfoClientService._internal(){
    socketService.socket.on("playersSpectatorsUpdate", (data) {
        game.updateFromJSON(data);
        notifyListeners();
      }
    );
  }

  void leaveGame(){
    socketService.socket.emit("leaveGame");
  }
}
