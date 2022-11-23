import 'dart:core';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/spectator.dart';

class GameSaved {

  // fields for the game-saved model used in database
  late String roomName;
  late List<String> players;
  late List<String> spectators;
  late List<String> winners;
  late List<num> scores;
  late num numberOfTurns;
  late String gameStartDate;
  late String playingTime;
  late num nbLetterReserve;
  late Map<String, String> mapLetterOnStand;
  late String? _id;

  GameSaved(List<Player> players,  this.roomName, this.numberOfTurns, this.playingTime, this.nbLetterReserve
      , this.gameStartDate, List<Spectator>? spectators, List<Player>? winners)
  {
    mapLetterOnStand = {};
    this.players = [];
    this.spectators = [];
    this.winners = [];
    scores = [];

    populateArrays(players, spectators, winners);
    populateMap(players);
  }

  GameSaved.fromJson(game) {
    roomName = game["roomName"];
    numberOfTurns = game["numberOfTurns"];
    playingTime = game["playingTime"];
    nbLetterReserve = game["nbLetterReserve"];
    gameStartDate = game["gameStartDate"];
    var playersString = game["players"];
    players = [];
    for (var pl in playersString){
        players.add(pl);
    }
    var winnersString = game["winners"];
    winners = [];
    for (var wn in winnersString) {
        winners.add(wn);
    }
    var spectatorsString = game["spectators"];
    spectators = [];
    for (var spec in spectatorsString) {
        spectators.add(spec);
    }
    var scoresString = game["scores"];
    scores = [];
    for (var sc in scoresString) {
        scores.add(sc);
    }
  }

  void populateArrays(List<Player> players, List<Spectator>? spectators, List<Player>? winners){
    for (var i = 0; i < players.length; i++) {
      this.players[i] = players[i].name;
    }
    for (var index = 0; index < 4; index++) {
      scores[index] = players[index].score;
    }
    if (spectators != null) {
      for (var index = 0; index < spectators.length; index++) {
        this.spectators[index] = spectators[index].name;
      }
    }
    if (winners != null) {
      for (var index = 0; index < winners.length; index++) {
        this.winners[index] = winners[index].name;
      }
    }
  }

  void populateMap(List<Player> players) {
    for (var player in players) {
      final entry = {player.name: lettersOnStand(player)};
      mapLetterOnStand.addEntries(entry.entries);
    }
  }

  String lettersOnStand(Player player) {
    const List<String> listLetterStillOnStand = [];
    for (var tile in player.stand) {
      if (tile.letter.value != '') {
        listLetterStillOnStand.add(tile.letter.value);
      }
    }
    return listLetterStillOnStand.toString();
  }

}
