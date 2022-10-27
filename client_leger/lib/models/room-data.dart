import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:flutter/cupertino.dart';

class RoomData with ChangeNotifier{
  late String name;
  late String timeTurn;
  late bool isBonusRandom;
  late String? passwd;

  late String roomCreator = "";
  int numberRealPlayer = 0;
  int numberVirtualPlayer = 0;
  late int numberSpectators;

  List<Player>players = [];

  List<Spectator> spectators = [];

  RoomData(
      {required this.name, required this.timeTurn, required this.isBonusRandom, required this.passwd, required this.players, required this.spectators});


  RoomData.fromJson(Map parsed){
    name = parsed["roomName"];
    timeTurn = parsed["timeTurn"].toString();
    isBonusRandom = parsed["isBonusRandom"];
    passwd = parsed["passwd"];

    var mapPlayers = parsed["players"];
    List<Player> newPlayers = [];
    for(var mapPlayer in mapPlayers){
      Player player = Player.fromJson(mapPlayer);
      if(player.isCreatorOfGame) roomCreator = player.name;
      if(player.idPlayer == "virtualPlayer") {
        numberVirtualPlayer++;
      } else {
        numberRealPlayer++;
      }
      newPlayers.add(player);
    }

    var mapSpects = parsed["spectators"];
    List<Spectator> newSpects = [];
    for(var mapSpect in mapSpects){
      Spectator spect = Spectator.fromJson(mapSpect);
      mapSpects.add(spect);
    }

    players = newPlayers;
    spectators = newSpects;
    numberSpectators = parsed["spectators"].length;
  }
}
