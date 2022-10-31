import 'package:flutter/cupertino.dart';

import 'command.dart';

class Spectator with ChangeNotifier{
  String socketId = '';
  late String name;
  List<Command> chatHistory = [];

  Spectator({required this.name});

  Spectator.fromJson(Map parsed) {
    notifyListeners();

  }

  static List<Spectator> createSpectatorsFromArray(Map parsed){
    // var mapPlayers = parsed["players"];
    // List<Player> newPlayers = [];
    // for(var mapPlayer in mapPlayers){
    //   Player player = Player.fromJson(mapPlayer);
    //   // if(player.isCreatorOfGame) roomCreator = player.name;
    //   // if(player.idPlayer == "virtualPlayer") {
    //   //   numberVirtualPlayer++;
    //   // } else {
    //   //   numberRealPlayer++;
    //   // }
    //   newPlayers.add(player);
    // }
    return <Spectator>[];

  }
}
