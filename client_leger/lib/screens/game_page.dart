import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:flutter/material.dart';

class GamePage extends StatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {

  GameService gameService = GameService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Row(
        children: [
          Container(
            color: Theme.of(context).colorScheme.secondary,
            width: 100,
            child: Column(
              children: [
                const SizedBox(
                  height: 30,
                ),
                IconButton(
                  onPressed: _leaveGame,
                  color: Theme.of(context).colorScheme.primary,
                  icon: Icon(
                    Icons.arrow_back,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: Container(
              color: Theme.of(context).colorScheme.primary,
              padding:
                  const EdgeInsets.symmetric(vertical: 20.0, horizontal: 20.0),
              child: const GameBoard(),
            ),
          ),
        ],
      ),
    );
  }

  void _leaveGame() {
    gameService.leaveGame();
    Navigator.of(context).pop();
  }
}
