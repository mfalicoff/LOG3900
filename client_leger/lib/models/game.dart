import 'package:client_leger/models/player.dart';

class Game {
  List<PlayerOld> players = [];
  int timer = 0;
  bool waitingPlayers = true;

  Game.fromJSON(data){
    for(int i = 0; i < 4; i++){
      players.add(PlayerOld.fromJSON(data["players"][i]));
    }
  }

  Game(){}

  updateFromJSON(data){
    List<PlayerOld> playersTemp = [];
    for(int i = 0; i < 4; i++){
      playersTemp.add(PlayerOld.fromJSON(data["players"][i]));
    }
    players = playersTemp;
  }
}
