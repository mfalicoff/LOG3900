import 'command.dart';

class Spectator {
  String socketId = '';
  String name;
  List<Command> chatHistory = [];

  Spectator({required this.name});
}
