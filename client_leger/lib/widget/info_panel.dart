import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/widget/list_players.dart';
import 'package:flutter/material.dart';

class InfoPanel extends StatefulWidget {
  const InfoPanel({Key? key}) : super(key: key);

  @override
  State<InfoPanel> createState() => _InfoPanelState();
}

class _InfoPanelState extends State<InfoPanel> {
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();
  final TimerService timerService = TimerService();
  final TapService tapService = TapService();

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
    infoClientService.actualRoom.addListener(refresh);
    timerService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      color: Theme.of(context).colorScheme.secondary,
      child: Column(
        children: [
          FittedBox(
            child: Text(
              infoClientService.displayTurn,
              style: TextStyle(
                  color: Theme.of(context).colorScheme.primary, fontSize: 20),
            ),
          ),
          const SizedBox(
            height: 5,
          ),
          Container(
            child: infoClientService.game.gameStarted ? Text(
              timerService.displayTimer,
              style: TextStyle(
                  color: Theme.of(context).colorScheme.primary, fontSize: 20),
            ) : null,
          ),
          const SizedBox(
            height: 5,
          ),
          Container(
            child: infoClientService.isSpectator == true
                ? Container()
                : Row(
                    children: [
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _pass,
                          child: FittedBox(
                            child: Text(
                              "Passer",
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _trade,
                          child: FittedBox(
                            child: Text(
                              "Échanger",
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _cancel,
                          child: FittedBox(
                            child: Text(
                              "Annuler",
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(
                        width: 5,
                      ),
                      Expanded(
                        child: ElevatedButton(
                          onPressed: _play,
                          child: FittedBox(
                            child: Text(
                              "Jouer",
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
          ),
          const SizedBox(
            height: 5,
          ),
          const ListPlayers(),
        ],
      ),
    );
  }

  void _pass() {
    if(infoClientService.isTurnOurs && infoClientService.game.gameStarted) {
      socketService.socket.emit('turnFinished');
    }
  }

  void _trade() {}

  void _cancel() {}

  void _play() {
    tapService.play(socketService.socket);
  }
}
