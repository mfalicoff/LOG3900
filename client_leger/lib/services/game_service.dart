import 'package:client_leger/services/socket_service.dart';

import '../models/game.dart';

class GameService{

  static final GameService _gameService = GameService._internal();

  SocketService socketService = SocketService();
  Game game = Game();

  factory GameService(){
    return _gameService;
  }

  GameService._internal(){
    socketService.socket.on("playersSpectatorsUpdate", (data) {
        game.updateFromJSON(data);
      }
    );
  }

  void leaveGame(){
    socketService.socket.emit("leaveGame");
  }
}
