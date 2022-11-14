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
    final TimerService timerService = TimerService();
    late GameSaved gameSaved;
    late String roomName;
    late String creator;
    List<Player> players = [];
    List<Player> spectators = [];
    List<String> winners = ["GagnantParDefaut"];
    late int numberOfTurns;
    late String playingTime;
    late String timestamp = '';

    @override
  void initState() {
    roomName = infoClientService.actualRoom.name;
    players = infoClientService.actualRoom.players;
    players.sort((element1, element2) => element2.score - element1.score);
    _findNumberOfTurns();
    _findCreatorOfGame();
    _getGameStartDate();
    _displayPlayingTime();
    _saveGame;
    super.initState();
  }

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
                const SizedBox(
                    height: 10,
                ),
                Text("Salle : $roomName",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Createur de la salle : $creator",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Spectateurs :",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                _isThereSpectators()
                ,
                const SizedBox(
                    height: 10,
                ),
                Text("Gagnants de la partie :",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: List.generate(infoClientService.game.winners.length, (index) {
                            return Text("Nom: ${infoClientService.game.winners[index].name}   avec un score de: ${infoClientService.game.winners[index].score}",
                                    style: TextStyle(
                                        color: Theme.of(context).colorScheme.primary
                                    ),
                                    textAlign: TextAlign.left,
                            );
                    }),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Nombre de lettres restantes dans la reserve : ${infoClientService.game.nbLetterReserve}",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Nombre de tours total: $numberOfTurns",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Temps joué (en minutes) : $playingTime",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Date du début de la partie (timestamp): $timestamp",
                    textAlign: TextAlign.left,
                    selectionColor: const Color(0xFF0c483f),
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Row(
                    children: [
                        const Text("Ajouter la partie dans vos favoris: "),
                        ElevatedButton(
                            onPressed: _addGameToFavourites,
                            child: const Icon(Icons.playlist_add_sharp),
                        ),
                    ],
                ),
                const SizedBox(
                    height: 35,
                ),
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child: Center(
                        child: Text("STATISTIQUES DES JOUEURS",
                                        textAlign: TextAlign.center,
                                        style: Theme.of(context).textTheme.titleLarge,
                                    )
                        ),
                ),
                Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                        Column(
                            children: [
                                Text("JOUEUR: ${players[0].name}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Score: ${players[0].score}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Lettres sur le chevalet: ${lettersOnStand(players[0])}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Nombre de tours joue dans la partie: ${players[0].turn}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                            ],
                        ),
                        const SizedBox(
                            width: 35,
                        ),
                        Column(

                            children: [
                                Text("JOUEUR: ${players[1].name}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Score: ${players[1].score}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Lettres sur le chevalet: ${lettersOnStand(players[1])}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Nombre de tours joue dans la partie: ${players[1].turn}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                            ],
                        ),
                        const SizedBox(
                            width: 35,
                        ),
                        Column(

                            children: [
                                Text("JOUEUR: ${players[2].name}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Score: ${players[2].score}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Lettres sur le chevalet: ${lettersOnStand(players[2])}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Nombre de tours joue dans la partie: ${players[2].turn}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                            ],
                        ),
                        const SizedBox(
                            width: 50,
                        ),
                        Column(

                            children: [
                                Text("JOUEUR: ${players[3].name}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Score: ${players[3].score}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Lettres sur le chevalet: ${lettersOnStand(players[3])}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                                Text("Nombre de tours joue dans la partie: ${players[3].turn}",
                                    style: Theme.of(context).textTheme.bodyLarge,
                                ),
                            ],
                        ),
                    ],
                ),
            ],
          )
        );
    }

    String lettersOnStand(Player player) {
        late String lettersStillOnStand = "";
        for (var tile in player.stand) {
            if (tile.letter.value != '') {
                lettersStillOnStand += tile.letter.value;
            }
        }
        return lettersStillOnStand.toString();

    }

    void _findNumberOfTurns() {
        numberOfTurns = infoClientService.actualRoom.players[0].turn
                        + infoClientService.actualRoom.players[1].turn
                        + infoClientService.actualRoom.players[2].turn
                        + infoClientService.actualRoom.players[3].turn;
    }

    void _getGameStartDate() {
        timestamp = infoClientService.game.gameStart.toString();
    }

    void _displayPlayingTime() {
        const secondsInMinute = 60;
        const displayZero = 9;
        final minutesToDisplay = timerService.playingTime / secondsInMinute;
        final secondsToDisplay = timerService.playingTime % secondsInMinute;
        if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0${minutesToDisplay.floor()}:0$secondsToDisplay";
        } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
            playingTime = "${minutesToDisplay.floor()}:0$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0${minutesToDisplay.floor()}:$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
            playingTime = "${minutesToDisplay.floor()}:$secondsToDisplay";
        }
    }

    void _findCreatorOfGame() {
        creator = infoClientService.actualRoom.players.firstWhere((element) => element.isCreatorOfGame).name;
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
            children: const [ Text("Il n'y a pas de spectateurs.")],
        );
    }

    Future<void> _addGameToFavourites() async {
        await usersController.updateFavouriteGames(socketService.gameId);
    }

    void _saveGame() {
        if (socketService.socket.id == infoClientService.game.masterTimer) {
            gameSaved = GameSaved(infoClientService.actualRoom.players,
                        infoClientService.actualRoom.name,
                        numberOfTurns,
                        playingTime,
                        infoClientService.game.nbLetterReserve,
                        timestamp,
                        infoClientService.actualRoom.spectators,
                        infoClientService.game.winners);
            socketService.socket.emit('saveGame', gameSaved);
        }
    }

}
