import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:flutter/material.dart';


class EndGameResultsPage extends StatefulWidget {
  const EndGameResultsPage({Key? key}) : super(key: key);

  @override
  State<EndGameResultsPage> createState() => _EndGameResultsPage();
}
class _EndGameResultsPage extends State<EndGameResultsPage> {
    final InfoClientService infoClientService = InfoClientService();
    String _creator = "Stephane";
    List<String> spectators = ["Lisa", "Varys"];
    List<String> players = ["Petyr", "Robert", "Cersei", "Eddard"];
    List<String> winners = ["Cersei", "Petyr"];

    @override
    Widget build(BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          insetPadding: const EdgeInsets.all(90.0),
          child: ListView(
            scrollDirection: Axis.vertical,
            children: [
                Text("RESULTATS DE FIN DE PARTIE",
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.titleLarge,
                ),

                Text("Createur de la salle : $_creator",
                    textAlign: TextAlign.left,
                    selectionColor: Theme.of(context).colorScheme.secondary,
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                ListView.builder(
                    itemBuilder:(context, index) =>
                    Text("Nom: $index"),
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: 10,
                )

            ],
          )
        //   child: Stack(
        //     children: [
        //         Center(
        //             child: Column(
        //                 verticalDirection: VerticalDirection.down,
        //                 crossAxisAlignment: CrossAxisAlignment.center,
        //                 children: [
        //                     Text(
        //                         "RESULTATS DE FIN DE PARTIE",
        //                         style: Theme.of(context).textTheme.titleLarge,

        //                     )
        //                 ],
        //             )
        //         ),
        //     ],
        //   )


        );
    }
}
