import 'package:flutter/cupertino.dart';

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
  late String stand; //TODO add Tile class
  late String avatarUri;
  late bool isCreatorOfGame;

  late String mapLetterOnStand;
  late int score;
  late int nbLetterStand;

  // CHAT SERVICE DATA
  late String lastWordPlaced;
  late String chatHistory; //TODO change the type and decide if we keep Command class
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
    // TODO STAND
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
