import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';

class RoomData {
  String name;
  String timeTurn;
  bool isBonusRandom;
  String passwd;

  List<Player>players;

  List<Spectator> spectators;

  RoomData(
      {required this.name, required this.timeTurn, required this.isBonusRandom, required this.passwd, required this.players, required this.spectators});
}
