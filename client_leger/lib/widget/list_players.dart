import 'package:client_leger/services/game_service.dart';
import 'package:flutter/material.dart';

class ListPlayers extends StatefulWidget {
  final GameService gameService;

  const ListPlayers({Key? key, required this.gameService}) : super(key: key);

  @override
  State<ListPlayers> createState() => _ListPlayersState();
}

class _ListPlayersState extends State<ListPlayers> {
  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(20),
      color: Theme.of(context).colorScheme.secondary,
      /*child: Table(
        border: const TableBorder(),
        columnWidths: const <int, TableColumnWidth>{
          0: FlexColumnWidth(),
          1: FlexColumnWidth(),
        },
        defaultVerticalAlignment: TableCellVerticalAlignment.middle,
*/ /*        children: const [
          TableRow(
            children: [
              Text("Nom Joueur"),
              Text("Score"),
            ],
          ),
        ],*/ /*
        children: List<TableRow>.generate(
          widget.gameService.game.players.length,
          (index) => TableRow(
            children: [
              Text(widget.gameService.game.players[index].name),
              Text(widget.gameService.game.players[index].score.toString()),
            ]
          ),
        ),
      ),*/
      /*child: DataTable(
        columns: [
          DataColumn(
            label: Expanded(
              child: Container(
                padding: EdgeInsets.zero,
                child: Text(
                  "Nom Joueur",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
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
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                  // textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
        ],
        rows: List<DataRow>.generate(
          widget.gameService.game.players.length,
          (int index) => DataRow(
            cells: [
              DataCell(
                Text(
                  widget.gameService.game.players[index].name,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
              ),
              DataCell(
                Text(
                  widget.gameService.game.players[index].score.toString(),
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
              ),
            ],
          ),
        ),
      ),*/
/*      child: Column(
        children: List<Text>.generate(
          widget.gameService.game.players.length,
          (index) => Text(
              widget.gameService.game.players[index].name
          ),
        ),
      ),*/
      child: ElevatedButton(
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
    );
  }

  void _start(){
    print(widget.gameService.game.players[0].name);
    print(widget.gameService.game.players[1].name);
    print(widget.gameService.game.players[2].name);
    print(widget.gameService.game.players[3].name);
  }

}
