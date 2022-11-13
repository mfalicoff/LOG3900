import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:flutter/material.dart';


class EndGameResultsPage extends StatefulWidget {
  const EndGameResultsPage({Key? key}) : super(key: key);

  @override
  State<EndGameResultsPage> createState() => _EndGameResultsPage();
}
class _EndGameResultsPage extends State<EndGameResultsPage> {
    final InfoClientService infoClientService = InfoClientService();
    final SocketService socketService = SocketService();
    final Controller usersController = Controller();
    late GameSaved gameSaved;
    final String _creator = "Stephane";
    List<String> spectators = ["Varys", "Illyzio"];
    List<String> players = ["Petyr", "Robert", "Cersei", "Eddard"];
    List<String> winners = ["Cersei", "Petyr"];
    List<int> scores = [56, 32, 45, 60];
    int nbLettres = 71;
    String playingTime = "10:52";
    String timestamp = DateTime.now().toString();

//       @override
//   void initState() {
//     _saveGame;
//     super.initState();
//   }

    @override
    Widget build(BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          insetPadding: const EdgeInsets.all(90.0),
          child: ListView(
            scrollDirection: Axis.vertical,
            children: [
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child: Center(
                        child: Text("RESULTATS DE FIN DE PARTIE",
                                        textAlign: TextAlign.center,
                                        style: Theme.of(context).textTheme.titleLarge,
                                    )
                        ),
                ),
                Text("Createur de la salle : $_creator",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                Text("Spectateurs :",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                _isThereSpectators()
                ,
                Text("Gagnants de la partie :",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: List.generate(winners.length, (index) {
                            return Text("Nom: ${winners[index]}   avec un score de: ${scores[index]}",
                                    style: const TextStyle(fontSize: 13),
                                    textAlign: TextAlign.left,
                            );
                    }),
                ),
                Text("Nombre de lettres restantes dans la reserve : $nbLettres",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                Text("Nombre de tours total: 65",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                Text("Durée de la partie (en minutes) : $playingTime",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                Text("Date du début de la partie (timestamp): $timestamp",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: Theme.of(context).textTheme.bodyLarge,
                ),
                ElevatedButton(
                    style: ButtonStyle(
                    padding: MaterialStateProperty.all(
                      const EdgeInsets.symmetric(
                          vertical: 6.0, horizontal: 10.0)
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(50.0)))),
                    onPressed: _addGameToFavourites,
                    child: const Icon(Icons.playlist_add_sharp),
                ),
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

    Column _isThereSpectators() {
        if (spectators.isNotEmpty) {
            return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: List.generate(spectators.length, (index) {
                            return Text("Nom: ${spectators[index]}",
                                    style: const TextStyle(fontSize: 13),
                                    textAlign: TextAlign.left,
                            );
                }),
            );
        }
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [ const Text("Il n'y a pas de spectateurs.")],
        );
    }

    Future<void> _addGameToFavourites() async {
        await usersController.updateFavouriteGames("63601927b755fa866314bfe6");
    }

    // void _saveGame() {
    //     if (socketService.socket.id == infoClientService.game.masterTimer) {
    //         gameSaved = GameSaved(infoClientService.actualRoom.players,
    //                     infoClientService.actualRoom.name,
    //                     10,
    //                     playingTime,
    //                     infoClientService.game.nbLetterReserve,
    //                     timestamp,
    //                     infoClientService.actualRoom.spectators,
    //                     infoClientService.game.winners);
    //         socketService.socket.emit('saveGame', gameSaved);
    //     }
    // }

}
