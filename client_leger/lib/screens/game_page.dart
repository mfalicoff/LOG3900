import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/info_panel.dart';
import 'package:flutter/material.dart';

import '../services/socket_service.dart';

class GamePage extends StatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

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
                if(infoClientService.gameMode == CLASSIC_MODE)...[
                  PowerListDialog(
                    notifyParent: refresh,
                  ),
                  // ElevatedButton(
                  //   style: ButtonStyle(
                  //     padding: MaterialStateProperty.all(
                  //       const EdgeInsets.symmetric(
                  //           vertical: 6.0, horizontal: 3.0),
                  //     ),
                  //     shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                  //       RoundedRectangleBorder(
                  //         borderRadius: BorderRadius.circular(10.0),
                  //       ),
                  //     ),
                  //   ),
                  //   onPressed: _leaveGame,
                  //   child: Text(
                  //     "Liste pouvoirs",
                  //     style: TextStyle(
                  //       color: Theme.of(context).colorScheme.secondary,
                  //     ),
                  //   ),
                  // ),
                ],
                Container(
                    child:
                        infoClientService.creatorShouldBeAbleToStartGame == true
                            ? const Text('Start Game')
                            : Container()),
                Container(
                    child: shouldSpecBeAbleToBePlayer() == true
                        ? ElevatedButton(
                            style: ButtonStyle(
                              padding: MaterialStateProperty.all(
                                const EdgeInsets.symmetric(
                                    vertical: 6.0, horizontal: 3.0),
                              ),
                              shape: MaterialStateProperty.all<
                                  RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10.0),
                                ),
                              ),
                            ),
                            onPressed: spectWantsToBePlayer,
                            child: Text(
                              "Remplacer joueur virtuel",
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.secondary,
                              ),
                            ),
                          )
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

  bool shouldSpecBeAbleToBePlayer() {
    if (infoClientService.game.gameFinished || !infoClientService.isSpectator) {
      return false;
    }
    if (infoClientService.actualRoom.numberVirtualPlayer > 0) {
      return true;
    } else {
      return false;
    }
  }

  spectWantsToBePlayer() {
    socketService.socket.emit('spectWantsToBePlayer');
  }

  void _leaveGame() {
    socketService.socket.emit('leaveGame');
    Navigator.popUntil(context, ModalRoute.withName("/game-list"));
  }
}

class PowerListDialog extends StatefulWidget {
  final Function() notifyParent;

  const PowerListDialog({super.key, required this.notifyParent});

  @override
  State<PowerListDialog> createState() => _PowerListDialog();
}

class _PowerListDialog extends State<PowerListDialog> {
  InfoClientService infoClientService = InfoClientService();
  final _formKey = GlobalKey<FormState>();
  late String? newName = "";

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: (infoClientService.player.powerCards.isNotEmpty) ? const Text('Cartes disponibles') : const Text(''),
          content: (infoClientService.player.powerCards.isEmpty) ? Text("Vous n'avez pas de pouvoir. Pour en obtenir un, vous devez placer " + (3 - infoClientService.player.nbValidWordPlaced).toString() + " mot(s) valide(s) sur le plateau.") : const Text(''),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            Container(
              decoration: BoxDecoration(border: Border.all()),
              height: 100,
              width: 200,
              child: ListView.builder(
                  shrinkWrap: true,
                  itemCount: infoClientService.player.powerCards.length,
                  itemBuilder: (BuildContext context, int index) {
                    return Text('\u2022 ${infoClientService.player.powerCards[index].name}',
                        style: const TextStyle(
                            color: Colors.black,
                            fontSize: 11,
                            decoration: TextDecoration.none));
                  }
              ),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, 'Cancel'),
              child: const Text('Cancel'),
            ),
          ],
        ),
      ),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll<Color>(Theme.of(context).colorScheme.primary),
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
      child: Text(
        "Liste pouvoirs",
        style: TextStyle(
          color: Theme.of(context).colorScheme.secondary,
        ),
      ),
    );
  }
}
