import 'dart:convert';
import 'dart:typed_data';
import 'dart:io' as Io;

class User {
  late List<dynamic>? actionHistory;
  late String? avatarPath;
  late String? avatarUri;
  late double? averagePointsPerGame;
  late double? averageTimePerGame;
  late String? cookie;
  late String email;
  late List<dynamic>? gameHistory;
  late int? gamesPlayed;
  late int? gamesWon;
  late String? id;
  late String username;
  late Io.File avatarImage;

  User(this.username, this.email);

  User.fromJson(Map parsed){
    username = parsed["data"]["name"] ?? "Failed";
    email = parsed["data"]["email"] ?? "Failed";
    actionHistory = parsed["data"]["actionHistory"] ?? "Failed";
    avatarPath = parsed["data"]["avatarPath"] ?? "Failed";
    avatarUri = parsed["data"]["avatarUri"] ?? "Failed";
    averagePointsPerGame = parsed["data"]["averagePointsPerGame"] ?? "Failed";
    averageTimePerGame = parsed["data"]["averageTimePerGame"] ?? "Failed";
    gameHistory = parsed["data"]["gameHistory"] ?? "Failed";
    gamesPlayed = parsed["data"]["gamesPlayed"] ?? "Failed";
    gamesWon = parsed["data"]["gamesWon"] ?? "Failed";
    id = parsed["data"]["_id"] ?? "Failed";
  }

  User clear() {
    return User("", "");
  }

  Uint8List getUriFromAvatar() {
    return base64Decode(avatarUri?.substring(22) as String);
  }

}
