import 'package:client_leger/services/socket_service.dart';

class GameService{
  SocketService socketService = SocketService();

  GameService(){}

  void leaveGame(){
    socketService.socket.emit("leaveGame");
  }
}
