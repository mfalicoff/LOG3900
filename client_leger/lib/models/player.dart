class Player {
  late String name;
  late String idPlayer;
  late int score;
  late bool isCreatorOfGame;
  late String? avatarUri;

  Player(this.name, this.idPlayer, this.score, this.isCreatorOfGame);

  Player.fromJSON(data){
    name = data["name"];
    score = data["score"];
    avatarUri = data['avatarUri'];
  }
}
