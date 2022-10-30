import 'package:client_leger/models/power-cards.dart';
import 'package:client_leger/constants/constants.dart';
import 'package:flutter/cupertino.dart';

import 'package:client_leger/models/tile.dart';

import 'command.dart';

// class PlayerOld {
//   late String name;
//   late String id;
//   late int score;
//   late bool isCreatorOfGame;
//   late String? avatarUri;
//
//   PlayerOld(this.name, this.id, this.score, this.isCreatorOfGame);
//
//   PlayerOld.fromJSON(data){
//     name = data["name"];
//     score = data["score"];
//     avatarUri = data['avatarUri'];
//   }
// }

class Player with ChangeNotifier {
  late String id;
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

  // POWERS
  late List<PowerCard> powerCards;
  late num nbValidWordPlaced;

  Player(this.name, this.isCreatorOfGame){
    powerCards = [PowerCard(name: JUMP_NEXT_ENNEMY_TURN, isActivated: true), PowerCard(name: REMOVE_POINTS_FROM_MAX, isActivated: true)];
    nbValidWordPlaced = 0;
  }

  Player.fromJson(Map parsed) {
    name = parsed["name"];
    isCreatorOfGame = parsed["isCreatorOfGame"];
    id = parsed["id"];

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
    powerCards = [];
    var powerCardsList = parsed["powerCards"];
    for(var powerCard in powerCardsList){
      powerCards.add(PowerCard.fromJson(powerCard));
    }
    nbValidWordPlaced = parsed["nbValidWordPlaced"];

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
