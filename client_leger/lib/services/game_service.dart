import 'package:client_leger/services/socket_service.dart';

import '../models/game.dart';

class GameService{
  SocketService socketService = SocketService();
  Game game = Game();

  GameService(){
    socketService.socket.on("playersSpectatorsUpdate", (data) {
        game.updateFromJSON(data);
        print(game.players[0].name);
      }
    );
  }

  void leaveGame(){
    socketService.socket.emit("leaveGame");
  }
}
