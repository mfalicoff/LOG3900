import 'package:client_leger/services/info_client_service.dart';
import 'package:flutter/material.dart';

import '../utils/utils.dart';

class ListPlayers extends StatefulWidget {
  const ListPlayers({Key? key}) : super(key: key);

  @override
  State<ListPlayers> createState() => _ListPlayersState();
}

class _ListPlayersState extends State<ListPlayers> {
  InfoClientService infoClientService = InfoClientService();

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
    return DataTable(
      columns: [
        DataColumn(
          label: Container(),
        ),
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
        infoClientService.actualRoom.players.length,
            (int index) => DataRow(
          cells: [
            DataCell(getAvatarFromString(
                22, infoClientService.actualRoom.players[index].avatarUri)),
            DataCell(
              Text(
                infoClientService.actualRoom.players[index].name,
                style: TextStyle(
                    color: Theme.of(context).colorScheme.primary),
              ),
            ),
            DataCell(
              Text(
                infoClientService.actualRoom.players[index].score.toString(),
                style: TextStyle(
                    color: Theme.of(context).colorScheme.primary),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
