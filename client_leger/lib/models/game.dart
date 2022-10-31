// import 'package:client_leger/models/player.dart';
// import 'package:flutter/cupertino.dart';
//
// class Game with ChangeNotifier{
//   List<PlayerOld> players = [];
//   int timer = 0;
//   bool waitingPlayers = true;
//   bool gameFinished = false;
//
//   Game.fromJSON(data){
//     for(int i = 0; i < 4; i++){
//       players.add(PlayerOld.fromJSON(data["players"][i]));
//     }
//     notifyListeners();
//   }
//
//   Game(){}
//
//   updateFromJSON(data){
//     List<PlayerOld> playersTemp = [];
//     for(int i = 0; i < 4; i++){
//       playersTemp.add(PlayerOld.fromJSON(data["players"][i]));
//     }
//     players = playersTemp;
//     notifyListeners();
//   }
// }
