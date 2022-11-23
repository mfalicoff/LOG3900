import 'dart:convert';

import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/timer.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/player.dart';
import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:flutter/material.dart';
import 'package:client_leger/models/user.dart';
import 'package:image/image.dart';
import 'package:http/http.dart' as http;

import '../env/environment.dart';
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
    bool isPressed = false;

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
    refresh() async {
    setState(() {});

  }

    @override
    Widget build(BuildContext context) {
        return Dialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          insetPadding: const EdgeInsets.all(65.0),
          // insetPadding:  ,
          child: ListView(
            scrollDirection: Axis.vertical,
            addAutomaticKeepAlives: false,
            padding: const EdgeInsets.only(top: 5.0, left: 15.0, bottom: 10.0),
            children: [
                Container(
                    height: 30,
                    color: Theme.of(context).colorScheme.primary,
                    child:

                    Row(

                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          const SizedBox( width: 400.0,),
                          Text("RESULTATS DE FIN DE PARTIE",
                                        textAlign: TextAlign.center,
                                        style: TextStyle(
                                          color: Theme.of(context).colorScheme.secondary,
                                          fontSize: 25,
                                        ),
                                    ),

                                    const SizedBox( width: 300.0,),
                                    ElevatedButton(
                                      style: ButtonStyle(shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                                                            RoundedRectangleBorder(
                                                               borderRadius: BorderRadius.circular(120.0) ),
                                                            ),

                                        ),
                                        onPressed: () => _leaveGame, // passing false
                                        child: Icon(Icons.close, color: Theme.of(context).colorScheme.secondary,)),
                                  ],
                        ),
                ),
                const SizedBox(
                    height: 10,
                ),
                Text("Salle: $roomName",
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
                Text("Createur de la salle: $creator",
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
                Text("Gagnants de la partie: ",
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
                Text("Nombre de lettres restantes dans la reserve: ${infoClientService.game.nbLetterReserve}",
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
                  Text("Durée de jeu (en minutes): $playingTime",
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
                            onPressed: isPressed == false ? _addGameToFavourites : null,
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
                                _isLinkEnabled(players[index], index),
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

    void _leaveGame() {
      socketService.count = 1;
      socketService.socket.emit('leaveGame');
      Navigator.popUntil(context, ModalRoute.withName("/home"));
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
        final end = infoClientService.game.endTime;
        final begin = infoClientService.game.startTime;
        final timeInSeconds = (end - begin) / 1000;
        final minutesToDisplay = (timeInSeconds / secondsInMinute).floor();
        final secondsToDisplay = (timeInSeconds % secondsInMinute).floor();
        if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0$minutesToDisplay:0$secondsToDisplay";
        } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
            playingTime = "$minutesToDisplay:0$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
            playingTime = "0$minutesToDisplay:$secondsToDisplay";
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
            playingTime = "$minutesToDisplay:$secondsToDisplay";
        }
    }

    void _findCreatorOfGame() {
        creator = infoClientService.actualRoom.players.firstWhere((element) => element.isCreatorOfGame).name;
    }

    Widget _isLinkEnabled(Player player, int index) {
        if (player.id != 'virtualPlayer') {
            return ProfileReadOnlyDialog(username: players[index].name, notifyParent: refresh);
        }
        return TextButton(onPressed: (() {

        }), child: Text(player.name, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 18, fontWeight: FontWeight.normal,)));
    }

    Column _isThereSpectators() {
        if (infoClientService.actualRoom.spectators.isNotEmpty) {
            return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.start,
                children: List.generate(infoClientService.actualRoom.spectators.length, (index) {
                                                return Column(
                                children: [
                                            Text('Spectateurs de la partie: ',
                                              style: TextStyle(
                                                  color: Theme.of(context).colorScheme.primary,
                                                  fontSize: 18,
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
        setState(() {
          isPressed = true;
        });
        await usersController.updateFavouriteGames(socketService.gameId);
    }

    void _saveGame() {
        gameSaved = GameSaved(infoClientService.actualRoom.players,
                infoClientService.actualRoom.name,
                numberOfTurns,
                playingTime,
                infoClientService.game.nbLetterReserve,
                timestamp,
                infoClientService.actualRoom.spectators,
                infoClientService.game.winners);
        if (socketService.socket.id == infoClientService.game.masterTimer) socketService.socket.emit('saveGame', gameSaved);

        print("Appel a save game light_client");

    }

}


class ProfileReadOnlyDialog extends StatefulWidget {
  final String username;
  final Function() notifyParent;

  const ProfileReadOnlyDialog({
      Key? key,
      required this.username,
      required this.notifyParent,
      }) : super(key: key);

  @override
  State<ProfileReadOnlyDialog> createState() => _ProfileReadOnlyStateDialog();
}

class _ProfileReadOnlyStateDialog extends State<ProfileReadOnlyDialog> {
    final Controller usersController = Controller();
    final String? serverAddress = Environment().config?.serverURL;
    late User currentUser;

      @override
    void initState() {
    super.initState();
    http.get(Uri.parse("$serverAddress/users/${widget.username}"))
        .then((res) => parseUser(res));
  }

  void parseUser(http.Response res) {
    var parsed = json.decode(res.body);
    currentUser = User.fromJson(parsed);
  }

    @override
  Widget build(BuildContext context) {
     return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
            title: const Text('STATISTIQUES', textAlign: TextAlign.center,),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5.0)),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            insetPadding: const EdgeInsets.all(25.0),
            actionsAlignment: MainAxisAlignment.spaceBetween,
            actions: [
                Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                        CircleAvatar(
                        radius: 30,
                        backgroundImage: MemoryImage(
                            currentUser.getUriFromAvatar()),
                        ),
                        // Text(currentUser.username, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold))
                    ],
                ),
                Row(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                        Text(currentUser.username, style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold))
                    ],
                ),
                Container(
                padding: const EdgeInsets.only(top: 30, bottom: 10),
                child: Table(
                    children: [
                    TableRow(
                        children: [
                        returnRowTextElement('Parties jouees'),
                        returnRowTextElement('Parties gagnes'),
                        returnRowTextElement('Score moyen par partie'),
                        returnRowTextElement('Temps moyen par partie'),
                        ],
                    ),
                    const TableRow(
                      children: [
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                        SizedBox(
                          height: 20,
                        ),
                      ],
                    ),
                    TableRow(
                        children: [
                        returnRowTextElement(currentUser.gamesPlayed
                            .toString()),
                        returnRowTextElement(
                            currentUser.gamesWon.toString()),
                        returnRowTextElement(currentUser.averagePointsPerGame!
                            .toStringAsFixed(2)),
                        averageTime(Duration(
                                milliseconds: currentUser.averageTimePerGame!
                                    .toInt())
                            .inSeconds),
                        ],
                    ),
                    ],
                ),
                ),
            ],
        ),
      ),
      child: Text(widget.username, style: TextStyle( color: Theme.of(context).colorScheme.primary),),
     );

  }
    Text returnRowTextElement(String textData) {
    return Text((textData),
        style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 13,
            decoration: TextDecoration.none,
            fontWeight: FontWeight.bold));
    }

    Text averageTime(num time) {
      const secondsInMinute = 60;
      const displayZero = 9;
      final minutesToDisplay = (time / secondsInMinute).floor();
      final secondsToDisplay = (time % secondsInMinute).floor();
      if (secondsToDisplay <= displayZero && minutesToDisplay <= displayZero) {
        return Text(("0$minutesToDisplay:0$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
      } else if (secondsToDisplay <= displayZero && minutesToDisplay > displayZero) {
        return Text(("$minutesToDisplay:0$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        } else if (secondsToDisplay > displayZero && minutesToDisplay <= displayZero) {
        return Text(("0$minutesToDisplay:$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        } else if (secondsToDisplay > displayZero && minutesToDisplay > displayZero) {
        return Text(("$minutesToDisplay:$secondsToDisplay"),
            style: TextStyle(color: Theme.of(context).colorScheme.primary, fontSize: 13, decoration: TextDecoration.none, fontWeight: FontWeight.bold));
        }
      return const Text('');
    }



}
