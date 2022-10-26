class PlayerOld {
  late String name;
  late String idPlayer;
  late int score;
  late bool isCreatorOfGame;

  PlayerOld(this.name, this.idPlayer, this.score, this.isCreatorOfGame);

  PlayerOld.fromJSON(data){
    name = data["name"];
    score = data["score"];
  }
}

class Player {
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
}
