import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/info_panel.dart';
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
                ElevatedButton(
                  style: ButtonStyle(
                    padding: MaterialStateProperty.all(
                      const EdgeInsets.symmetric(
                          vertical: 6.0, horizontal: 3.0),
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                      RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10.0),
                      ),
                    ),
                  ),
                  onPressed: _leaveGame,
                  child: Text(
                    "Quitter partie",
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.secondary,
                    ),
                  ),
                ),
              ],
            ),
          ),
          Container(
            color: Theme.of(context).colorScheme.primary,
            padding:
                const EdgeInsets.symmetric(vertical: 20.0, horizontal: 20.0),
            child: const GameBoard(),
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.fromLTRB(0, 100, 50, 100),
              color: Theme.of(context).colorScheme.primary,
              child: Column(
                children: const [
                  InfoPanel()
                ],
              ),
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
