import 'package:client_leger/models/player.dart';

class Game {
  List<Player> players = [];

  Game.fromJSON(data){
    for(int i = 0; i < 4; i++){
      players.add(Player.fromJSON(data["players"][i]));
    }
  }
  Game(){
  }

  updateFromJSON(data){
    List<Player> playersTemp = [];
    for(int i = 0; i < 4; i++){
      playersTemp.add(Player.fromJSON(data["players"][i]));
    }
    players = playersTemp;
  }
}
