import 'package:client_leger/services/game_service.dart';
import 'package:flutter/material.dart';

class InfoPanel extends StatefulWidget {
  const InfoPanel({Key? key}) : super(key: key);

  @override
  State<InfoPanel> createState() => _InfoPanelState();
}

class _InfoPanelState extends State<InfoPanel> {
  final GameService gameService = GameService();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      color: Theme.of(context).colorScheme.secondary,
      child: Column(
        children: [
          Text(
            "En attente d'autres joueurs...",
            style: TextStyle(
                color: Theme.of(context).colorScheme.primary, fontSize: 25),
          ),
          SizedBox(height: 5,),
          Row(
            children: [
              ElevatedButton(
                onPressed: _pass,
                child: Text(
                  "Passer",
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
              SizedBox(width: 5,),
              ElevatedButton(
                onPressed: _trade,
                child: Text(
                  "Échanger",
                  style:
                  TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
              SizedBox(width: 5,),
              ElevatedButton(
                onPressed: _cancel,
                child: Text(
                  "Annuler",
                  style:
                  TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
              SizedBox(width: 5,),
              ElevatedButton(
                onPressed: _play,
                child: Text(
                  "Jouer",
                  style:
                  TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ],
          ),
          SizedBox(height: 5,),
          DataTable(
            columns: [
              DataColumn(
                label: Expanded(
                  child: Container(
                    padding: EdgeInsets.zero,
                    child: Text(
                      "Nom Joueur",
                      overflow: TextOverflow.visible,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                      // textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
              DataColumn(
                label: Expanded(
                  child: Container(
                    padding: EdgeInsets.zero,
                    child: Text(
                      "Score",
                      overflow: TextOverflow.visible,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                      // textAlign: TextAlign.center,
                    ),
                  ),
                ),
              ),
            ],
            rows: List<DataRow>.generate(
              gameService.game.players.length,
              (int index) => DataRow(
                cells: [
                  DataCell(
                    Text(
                      gameService.game.players[index].name,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                    ),
                  ),
                  DataCell(
                    Text(
                      gameService.game.players[index].score.toString(),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _pass() {}

  void _trade() {}

  void _cancel() {}

  void _play() {}
}
