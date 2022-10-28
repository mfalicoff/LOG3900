import 'package:flutter/cupertino.dart';

import 'package:client_leger/models/tile.dart';

import 'command.dart';

class PlayerOld {
  late String name;
  late String idPlayer;
  late int score;
  late bool isCreatorOfGame;
  late String? avatarUri;

  PlayerOld(this.name, this.idPlayer, this.score, this.isCreatorOfGame);

  PlayerOld.fromJSON(data){
    name = data["name"];
    score = data["score"];
    avatarUri = data['avatarUri'];
  }
}

class Player with ChangeNotifier {
  late String idPlayer;
  late String name;
  late List<Tile> stand = [];
  late String avatarUri;
  late bool isCreatorOfGame;

  late Map<String, Object> mapLetterOnStand;
  late int score;
  late int nbLetterStand;

  // CHAT SERVICE DATA
  late String lastWordPlaced;
  late List<Command> chatHistory;
  late bool debugOn;
  late int passInARow;

  // MOUSE EVENT SERVICE DATA
  late int tileIndexManipulation;

  // OBJECTIVE DATA
  late int turn;
  late bool allLetterSwapped;
  late bool isMoveBingo;

  // Player() {
  //   name = 'DefaultPlayerObject';
  //   isCreatorOfGame = false;
  // }

  Player(this.name, this.isCreatorOfGame);

  Player.fromJson(Map parsed) {
    name = parsed["name"];
    isCreatorOfGame = parsed["isCreatorOfGame"];
    idPlayer = parsed["idPlayer"];

    // TODO verify this works
    var tileList = parsed["stand"];
    for(var tile in tileList){
      stand.add(Tile.fromJson(tile));
    }

    // TODO MAPLETTERSONSTAND
    score = parsed["score"];
    nbLetterStand = parsed["nbLetterStand"];
    lastWordPlaced = parsed["lastWordPlaced"];
    // TODO CHAT
    turn = parsed['turn'];
    tileIndexManipulation = parsed["tileIndexManipulation"];
    allLetterSwapped = parsed["allLetterSwapped"];
    avatarUri = parsed["avatarUri"];
    notifyListeners();
  }

  static List<Player> createPLayersFromArray(Map parsed){
    var mapPlayers = parsed["players"];
    List<Player> newPlayers = [];
    for(var mapPlayer in mapPlayers){
      Player player = Player.fromJson(mapPlayer);
      // if(player.isCreatorOfGame) roomCreator = player.name;
      // if(player.idPlayer == "virtualPlayer") {
      //   numberVirtualPlayer++;
      // } else {
      //   numberRealPlayer++;
      // }
      newPlayers.add(player);
    }
    return newPlayers;

  }
}
