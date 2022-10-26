import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/cupertino.dart';

import '../models/game.dart';

class GameService with ChangeNotifier{

  static final GameService _gameService = GameService._internal();

  SocketService socketService = SocketService();
  Game game = Game();
  bool isSpectator = false;
  bool creatorShouldBeAbleToStartGame = false;



  factory GameService(){
    return _gameService;
  }

  GameService._internal(){

    socketService.socket.on("playersSpectatorsUpdate", (data) {
        game.updateFromJSON(data);
        notifyListeners();
      }
    );

    socketService.socket.on('isSpectator', (isSpectatorVal) {
        isSpectator = isSpectatorVal;
        notifyListeners();
    }
    );

    socketService.socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) {
      creatorShouldBeAbleToStartGame = creatorCanStart;
      notifyListeners();
    }
    );
  }

  void leaveGame(){
    socketService.socket.emit("leaveGame");
  }
}
