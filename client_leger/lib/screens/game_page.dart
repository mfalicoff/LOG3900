import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/info_panel.dart';
import 'package:flutter/material.dart';

class GamePage extends StatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  InfoClientService infoClientService = InfoClientService();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
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
                Container(
                    child: infoClientService.creatorShouldBeAbleToStartGame == true
                        ? Text('Start Game')
                        : Container()),
                Container(
                    child: infoClientService.isSpectator == true
                        ? Text('Prendre la place de un joueur virtuel')
                        : Container())
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
                children: const [InfoPanel()],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _leaveGame() {
    infoClientService.leaveGame();
    Navigator.popUntil(context, ModalRoute.withName("/game-list"));
  }

}
