import 'package:client_leger/models/letter.dart';
import 'package:client_leger/models/vec4.dart';

class Tile {
  late Vec4 position;
  late Letter letter;
  late String? bonus;
  late bool old;
  late String backgroundColor;
  late String borderColor;
  late bool isOnBoard;

  Tile() {
    position = Vec4();
    letter = Letter();
    bonus = '';
    old = false;
    backgroundColor = '#F7F7E3';
    borderColor = '#212121';
    isOnBoard = false;
  }

  Tile.fromJson(tile){
    //TODO position
    //position = Vec4(tile["value"]);
  }
}
