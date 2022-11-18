import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:flutter/material.dart';
import 'package:image/image.dart';

import '../models/spectator.dart';


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
    List<Spectator> spectators = [];
    List<String> winners = [];
    late int numberOfTurns;
    late String playingTime;
    late String timestamp = '';

    @override
  void initState() {
    super.initState();
    roomName = infoClientService.actualRoom.name;
    players = infoClientService.actualRoom.players;
    spectators = infoClientService.actualRoom.spectators;
    players.sort((element1, element2) => element2.score - element1.score);
    _findNumberOfTurns();
    _findCreatorOfGame();
    _getGameStartDate();
    _displayPlayingTime();
    _saveGame;
  }

    @override
    Widget build(BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          insetPadding: const EdgeInsets.all(65.0),
          child: ListView(
            scrollDirection: Axis.vertical,
            addAutomaticKeepAlives: false,
            children: [
              const SizedBox(
                height: 35,
              ),
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child:

                    Center(
                        child: Text("RESULTATS DE FIN DE PARTIE",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.secondary,
                                          fontSize: 25,
                                        ),
                                    )
                        ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Salle : $roomName",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 18,
                        fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Createur de la salle : $creator",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
              _isThereSpectators(),
                const SizedBox(
                    height: 10,
                ),
                Text("Gagnants de la partie :",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: List.generate(infoClientService.game.winners.length, (index) {
                            return Text("Nom:  ${infoClientService.game.winners[index].name}  avec un score de ${infoClientService.game.winners[index].score} points",
                                    style: const TextStyle(
                                      color: Colors.black,
                                      fontSize: 15,
                                      fontWeight: FontWeight.normal,
                                      fontFamily: "Times New Roman"
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
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Nombre de tours total: $numberOfTurns",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                  Text("Durée de la partie (en minutes) : $playingTime",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 18,
                        fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Date du début de la partie (timestamp): $timestamp",
                    textAlign: TextAlign.left,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 18,
                      fontWeight: FontWeight.normal,
                        fontFamily: "Times New Roman"
                    ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Row(
                    children: [
                        Text("Ajouter la partie dans vos favoris: ",
                          textAlign: TextAlign.left,
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 18,
                            fontWeight: FontWeight.normal,
                              fontFamily: "Times New Roman"
                          ),
                        ),
                        ElevatedButton(
                            onPressed: _addGameToFavourites,
                            child: const Icon(Icons.playlist_add_sharp),
                        ),
                    ],
                ),
                const SizedBox(
                    height: 15,
                ),
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child: Center(
                        child: Text("STATISTIQUES DES JOUEURS",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.secondary,
                                          fontSize: 25,
                                        ),
                                    )
                        ),
                ),
                const SizedBox(
                  height: 20,
                ),
                Row(
                    mainAxisSize: MainAxisSize.max,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(players.length, (index) {
                      return
                        Column(
                            children: [
                                Text("JOUEUR: ${players[index].name}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.normal,
                                  ),
                                ),
                                Text("Score: ${players[index].score}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.normal,
                                  ),
                                ),
                                Text("Lettres restantes: ${lettersOnStand(players[index])}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.normal,
                                  ),
                                ),
                                Text("Nombre de tours joué: ${players[index].turn}",
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontSize: 18,
                                    fontWeight: FontWeight.normal,

                                  ),
                                ),
                            ],
                        );
                    }),
                ),
            ],
          )
        );
    }

    String lettersOnStand(Player player) {
        List<String> lettersStillOnStand = [];
        for (var tile in player.stand) {
            if (tile.letter.value != '') {
                lettersStillOnStand.add(tile.letter.value);
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
        timestamp = infoClientService.game.gameStart.toString().replaceFirst('GMT-0500 (heure normale de l’Est nord-américain)', '');
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
        if (infoClientService.actualRoom.spectators.isNotEmpty) {
            return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: List.generate(infoClientService.actualRoom.spectators.length, (index) {
                                                return Column(
                                children: [
                                            const Text('.Spectateurs de la partie: ',
                                            style: TextStyle(
                                                color: Colors.black,
                                                fontSize: 15,
                                                fontWeight: FontWeight.normal,
                                                fontFamily: "Times New Roman"
                                                ),
                                    textAlign: TextAlign.left,
                                           ),
                                            Text("Nom: ${infoClientService.actualRoom.spectators[index].name}",
                                            style: const TextStyle(
                                                color: Colors.black,
                                                fontSize: 15,
                                                fontWeight: FontWeight.normal,
                                                fontFamily: "Times New Roman"
                                                ),
                                            ),
                                ],
                            );
                }),
            );
        }
        return Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: const [ Text("Il n'y a pas de spectateurs.", style: TextStyle( color: Colors.black, fontSize: 15))],
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
