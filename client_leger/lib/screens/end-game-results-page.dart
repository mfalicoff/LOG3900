import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:flutter/material.dart';

class EndGameResultsPage extends StatelessWidget{
    const EndGameResultsPage({Key? key}) : super(key: key);

    @override
    Widget build(BuildContext context) {
        return SimpleDialog(
          title: const Text('RESULTATS DE FIN DE PARTIE'),
          children: <Widget>[
            SimpleDialogOption(
              onPressed: () { Navigator.pop(context, 'Ajouter partie aux favoris'); },
              child: const Text('Treasury department'),
            )
          ],
        );
    }
}
