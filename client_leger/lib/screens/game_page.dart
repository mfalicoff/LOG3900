import 'package:client_leger/services/game_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/list_players.dart';
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
                children: [
                  ListPlayers(gameService: gameService,)
                ],
              ),
            ),
          ),
          ElevatedButton(
            style: ButtonStyle(
              padding: MaterialStateProperty.all(
                const EdgeInsets.symmetric(
                    vertical: 18.0, horizontal: 40.0),
              ),
              shape: MaterialStateProperty.all<
                  RoundedRectangleBorder>(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            ),
            onPressed: _start,
            child: Text(
              "Démarrer",
              style: TextStyle(
                  fontSize: 20,
                  color: Theme.of(context)
                      .colorScheme
                      .secondary),
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

  void _start() {
    print(gameService.game.players[0].name);
    print(gameService.game.players[1].name);
    print(gameService.game.players[2].name);
    print(gameService.game.players[3].name);
  }
}
