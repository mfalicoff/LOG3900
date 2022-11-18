import 'dart:convert';
import 'dart:typed_data';

import 'package:client_leger/constants/constants.dart';
import 'package:client_leger/screens/end-game-results-page.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/widget/game_board.dart';
import 'package:client_leger/widget/info_panel.dart';
import 'package:flutter/material.dart';
import 'package:flip_card/flip_card.dart';

import '../models/player.dart';
import '../services/socket_service.dart';
import '../widget/chat_panel.dart';

class GamePage extends StatefulWidget {
  const GamePage({Key? key}) : super(key: key);

  @override
  State<GamePage> createState() => _GamePageState();
}

class _GamePageState extends State<GamePage> {
  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();

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
    return Scaffold(
      resizeToAvoidBottomInset: false,
      endDrawer: Drawer(width: 600, child: ChatPanel(isInGame: true,)),
      body: Stack(
        children: [
          Row(
            children: [
              Container(
                color: Theme.of(context).colorScheme.secondary,
                width: 100,
                child: Column(
                  children: [
                    const SizedBox(
                      height: 30,
                    ),
                    Container(
                      child: shouldBeAbleToLeaveGame()
                          ? ElevatedButton(
                              style: ButtonStyle(
                                padding: MaterialStateProperty.all(
                                  const EdgeInsets.symmetric(
                                      vertical: 6.0, horizontal: 3.0),
                                ),
                                shape: MaterialStateProperty.all<
                                    RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                ),
                              ),
                              onPressed: _leaveGame,
                              child: Text(
                                "Quitter partie",
                                style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary,
                                ),
                              ),
                            )
                          : null,
                    ),
                    Container(
                      child: shouldBeAbleToGiveUpGame()
                          ? ElevatedButton(
                              style: ButtonStyle(
                                padding: MaterialStateProperty.all(
                                  const EdgeInsets.symmetric(
                                      vertical: 6.0, horizontal: 3.0),
                                ),
                                shape: MaterialStateProperty.all<
                                    RoundedRectangleBorder>(
                                  RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10.0),
                                  ),
                                ),
                              ),
                              onPressed: () => _giveUpGame(context),
                              child: Text(
                                "Abandonner",
                                style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary,
                                ),
                              ),
                            )
                          : null,
                    ),
                    if (infoClientService.gameMode == POWER_CARDS_MODE) ...[
                      PowerListDialog(
                        notifyParent: refresh,
                      ),
                    ],
                    const SizedBox(
                      height: 5,
                    ),
                    Container(
                        child: infoClientService
                                    .creatorShouldBeAbleToStartGame ==
                                true
                            ? ElevatedButton(
                                style: ButtonStyle(
                                  padding: MaterialStateProperty.all(
                                    const EdgeInsets.symmetric(
                                        vertical: 6.0, horizontal: 3.0),
                                  ),
                                  shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                  ),
                                ),
                                onPressed: _startGame,
                                child: Text(
                                  "Demarrer partie",
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.secondary,
                                  ),
                                ),
                              )
                            : null),
                    Container(
                        child: infoClientService.game.gameFinished == true
                        ? ElevatedButton(
                            style: ButtonStyle(
                            padding: MaterialStateProperty.all(
                                const EdgeInsets.symmetric(
                            vertical: 18.0, horizontal: 0.0),
                            ),
                            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                                RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(100.0)))),
                                onPressed: () {
                                    showDialog(context: context, builder: (context) => const EndGameResultsPage(),
                                    );
                                },
                        child: const Text('End Game Results'),
                        )

                    : null),
                    Container(
                        child: shouldSpecBeAbleToBePlayer() == true
                            ? ElevatedButton(
                                style: ButtonStyle(
                                  padding: MaterialStateProperty.all(
                                    const EdgeInsets.symmetric(
                                        vertical: 6.0, horizontal: 3.0),
                                  ),
                                  shape: MaterialStateProperty.all<
                                      RoundedRectangleBorder>(
                                    RoundedRectangleBorder(
                                      borderRadius: BorderRadius.circular(10.0),
                                    ),
                                  ),
                                ),
                                onPressed: spectWantsToBePlayer,
                                child: Text(
                                  "Remplacer joueur virtuel",
                                  style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.secondary,
                                  ),
                                ),
                              )
                            : Container())
                  ],
                ),
              ),
              Container(
                color: Theme.of(context).colorScheme.primary,
                padding: const EdgeInsets.symmetric(
                    vertical: 20.0, horizontal: 20.0),
                child: const GameBoard(),
              ),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.fromLTRB(0, 100, 50, 100),
                  color: Theme.of(context).colorScheme.primary,
                  child: Column(
                    children: const [InfoPanel(), ChatPanelOpenButton()],
                  ),
                ),
              ),
            ],
          ),
          if (infoClientService.incomingPlayer != "")
            AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.secondary,
              title: Text(
                'Le joueur ${infoClientService.incomingPlayer} essaye de se connecter.\nVoulez vous l\'accepter dans la partie ?',
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
              actions: <Widget>[
                ElevatedButton(
                  child: Text(
                    'Refuser',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.secondary),
                  ),
                  onPressed: () {
                    acceptPlayer(false);
                    Navigator.pop(context);
                  },
                ),
                ElevatedButton(
                  child: Text(
                    'Accepter',
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.secondary),
                  ),
                  onPressed: () {
                    acceptPlayer(true);
                    Navigator.pop(context);
                  },
                ),
              ],
            )
          else Container(),
          StatefulBuilder(
              builder: (BuildContext context, StateSetter setState) {
                return Positioned(
                  top: 20,
                  right: 30,
                  child: IconButton(
                    iconSize: 50,
                    icon: CircleAvatar(
                      radius: 50,
                      backgroundColor: Theme.of(context).colorScheme.secondary,
                      backgroundImage:
                        infoClientService.soundDisabled ?
                        const AssetImage('assets/volume-off.png') :
                        const AssetImage('assets/volume-on.png'),
                    ),
                    onPressed: () {
                      setState(() =>{infoClientService.soundDisabled = !infoClientService.soundDisabled});
                      infoClientService.notifyListeners();
                      socketService.notifyListeners();
                    },
                  ),
                );
              }
          ),
        ],
      ),
    );
  }

  void acceptPlayer(bool isPlayerAccepted) {
    if (isPlayerAccepted) {
      socketService.socket
          .emit('acceptPlayer', [true, infoClientService.incomingPlayerId]);
    } else {
      socketService.socket
          .emit('acceptPlayer', [false, infoClientService.incomingPlayerId]);
    }
    infoClientService.incomingPlayer = '';
    infoClientService.incomingPlayerId = '';
  }

  bool shouldBeAbleToLeaveGame() {
    if (infoClientService.isSpectator ||
        !infoClientService.game.gameStarted ||
        infoClientService.game.gameFinished) {
      return true;
    }
    return false;
  }

  bool shouldBeAbleToGiveUpGame() {
    if (!infoClientService.isSpectator &&
        infoClientService.game.gameStarted &&
        !infoClientService.game.gameFinished) {
      return true;
    }
    return false;
  }

  bool shouldSpecBeAbleToBePlayer() {
    if (infoClientService.game.gameFinished || !infoClientService.isSpectator) {
      return false;
    }
    if (infoClientService.actualRoom.numberVirtualPlayer > 0) {
      return true;
    } else {
      return false;
    }
  }

  spectWantsToBePlayer() {
    socketService.socket.emit('spectWantsToBePlayer');
  }

  void _startGame() {
    socketService.socket.emit('startGame', infoClientService.game.roomName);
    infoClientService.creatorShouldBeAbleToStartGame = false;
  }

  void _leaveGame() {
    socketService.socket.emit('leaveGame');
    Navigator.popUntil(context, ModalRoute.withName("/game-list"));
  }

  Future<void> _giveUpGame(BuildContext context) {
    return showDialog<void>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Abandonner la partie?'),
          content: const Text('Êtes-vous sûr de vouloir abandonner la partie?'),
          actions: <Widget>[
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: const Text('Abandonner'),
              onPressed: () {
                socketService.socket.emit('giveUpGame');
                Navigator.popUntil(context, ModalRoute.withName("/game-list"));
              },
            ),
            TextButton(
              style: TextButton.styleFrom(
                textStyle: Theme.of(context).textTheme.labelLarge,
              ),
              child: const Text('Annuler'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            ),
          ],
        );
      },
    );
  }
}

class PowerListDialog extends StatefulWidget {
  final Function() notifyParent;

  const PowerListDialog({super.key, required this.notifyParent});

  @override
  State<PowerListDialog> createState() => _PowerListDialog();
}

class _PowerListDialog extends State<PowerListDialog> {
  final _formKey = GlobalKey<FormState>();
  late String? coords = "";

  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();
  late String? newName = "";
  int idxChosenLetterStand = 0;
  String chosenLetterReserve = "";

  @override
  Widget build(BuildContext context) {
    if (infoClientService.letterReserve.isNotEmpty) {
      chosenLetterReserve = infoClientService.letterReserve[0];
    } else {
      chosenLetterReserve = '';
    }
    for (int i = 0; i < infoClientService.player.stand.length; i++) {
      if (infoClientService.player.stand[i].letter.value == '') {
        continue;
      }
      idxChosenLetterStand = i;
      break;
    }
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (!infoClientService.powerUsedForTurn &&
                    infoClientService.isTurnOurs) ...[
                  if (infoClientService.player.powerCards.isNotEmpty) ...[
                    Text(
                      'Cartes disponibles',
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontWeight: FontWeight.bold,
                          fontSize: 17,
                          decoration: TextDecoration.none),
                    ),
                  ],
                  if (infoClientService.player.powerCards.isEmpty) ...[
                    Text(
                        "Vous n'avez pas de pouvoir. Pour en obtenir un, vous devez placer ${3 - infoClientService.player.nbValidWordPlaced} mot(s) valide(s) sur le plateau.",
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 11,
                            decoration: TextDecoration.none)),
                  ],
                  Container(
                    margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                    height: 350,
                    width: 300,
                    child: ListView.builder(
                        shrinkWrap: true,
                        itemCount: infoClientService.player.powerCards.length,
                        itemBuilder: (BuildContext context, int index) {
                          return Container(
                            // height: 100,
                            margin: const EdgeInsets.fromLTRB(0, 0, 0, 10),
                            child: Row(
                              children: <Widget>[
                                FlipCard(
                                  direction: FlipDirection.HORIZONTAL,
                                  front: Container(
                                    width: 100,
                                    height: 100,
                                    // color: Colors.red,
                                    child: const Image(
                                        image: AssetImage("assets/card.png")),
                                  ),
                                  back: Container(
                                    decoration: BoxDecoration(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      borderRadius: const BorderRadius.all(
                                          Radius.circular(5)),
                                    ),
                                    width: 150,
                                    height: 100,
                                    margin:
                                        const EdgeInsets.fromLTRB(0, 0, 40, 10),
                                    // color: Theme.of(context).colorScheme.primary,
                                    child: Padding(
                                      padding: const EdgeInsets.fromLTRB(
                                          10, 10, 10, 10),
                                      child: Text(
                                        infoClientService
                                            .player.powerCards[index].name,
                                        style: TextStyle(
                                          fontSize: 12.0,
                                          color: Theme.of(context)
                                              .colorScheme
                                              .secondary,
                                        ),
                                        textAlign: TextAlign.justify,
                                      ),
                                    ),
                                  ),
                                ),
                                TextButton(
                                  style: ButtonStyle(
                                    backgroundColor: MaterialStatePropertyAll<
                                            Color>(
                                        Theme.of(context).colorScheme.primary),
                                  ),
                                  onPressed: () => {
                                    _onPowerCardClick(infoClientService
                                        .player.powerCards[index].name)
                                  },
                                  child: Text(
                                    "Utiliser",
                                    style: TextStyle(
                                      color: Theme.of(context)
                                          .colorScheme
                                          .secondary,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, 'Annuler'),
                    child: const Text('Annuler'),
                  ),
                ],
                if (infoClientService.powerUsedForTurn) ...[
                  Container(
                    margin: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                    child: Text(
                      "Vous avez déjà utilisé une carte de pouvoir à ce tour-ci. Veuillez attendre le prochain tour.",
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 13,
                          decoration: TextDecoration.none),
                    ),
                  ),
                ],
                if (!infoClientService.isTurnOurs) ...[
                  Container(
                    width: 210,
                    margin: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                    child: Text(
                      "Ce n'est pas votre tour de jouer.",
                      textAlign: TextAlign.left,
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary,
                          fontSize: 13,
                          decoration: TextDecoration.none),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll<Color>(
            Theme.of(context).colorScheme.primary),
        padding: MaterialStateProperty.all(
          const EdgeInsets.symmetric(vertical: 6.0, horizontal: 6.0),
        ),
        shape: MaterialStateProperty.all<RoundedRectangleBorder>(
          RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(5.0),
          ),
        ),
      ),
      child: Text(
        "Liste pouvoirs",
        style: TextStyle(
          color: Theme.of(context).colorScheme.secondary,
        ),
      ),
    );
  }

  void _onPowerCardClick(String powerCardName) {
    socketService.socket.emit('requestLetterReserve');
    switch (powerCardName) {
      case TRANFORM_EMPTY_TILE:
        {
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              content: Text(
                'Veuillez entrer les coordonnées de la case à changer :',
                style: TextStyle(
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Form(
                  key: _formKey,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: [
                      TextFormField(
                        onSaved: (String? value) {
                          coords = value;
                        },
                        validator: _coordsValidator,
                        decoration: InputDecoration(
                          border: const OutlineInputBorder(),
                          labelText: "Coordonnées",
                          labelStyle: TextStyle(
                              color: Theme.of(context).colorScheme.primary),
                        ),
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      TextButton(
                        onPressed: _sendCoords,
                        child: const Text('Soumettre'),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, 'Annuler'),
                        child: const Text('Annuler'),
                      ),
                    ],
                  ),
                )
              ],
            ),
          );
          break;
        }
      case EXCHANGE_LETTER_JOKER:
        {
          List<List<Color>> standColors = initStandColors();
          List<List<Color>> reserveColors = initReserveColors();
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                      child: Column(
                        children: [
                          Text(
                            "Cliquez sur la lettre que vous voulez échanger :",
                            style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                decoration: TextDecoration.none),
                          ),
                          StatefulBuilder(builder:
                              (BuildContext context, StateSetter setState) {
                            return Container(
                              margin: const EdgeInsets.fromLTRB(0, 20, 0, 0),
                              height: 70,
                              width: 300,
                              child: GridView.count(
                                crossAxisCount: 7,
                                shrinkWrap: true,
                                children: List.generate(
                                    infoClientService.player.stand.length,
                                    (index) {
                                  return Container(
                                    margin:
                                        const EdgeInsets.fromLTRB(0, 0, 10, 0),
                                    child: TextButton(
                                      style: ButtonStyle(
                                        backgroundColor:
                                            MaterialStatePropertyAll<Color>(
                                                standColors[index][0]),
                                      ),
                                      onPressed: () => {
                                        setState(() => {
                                              standColors = _colorChangeStand(
                                                  standColors, index)
                                            }),
                                      },
                                      child: Text(
                                        infoClientService
                                            .player.stand[index].letter.value,
                                        style: TextStyle(
                                          fontSize: 17,
                                          color: standColors[index][1],
                                        ),
                                      ),
                                    ),
                                  );
                                }),
                              ),
                            );
                          }),
                          if (chosenLetterReserve != '') ...[
                            Text(
                              "Cliquez sur la lettre que vous voulez prendre de la reserve :",
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  decoration: TextDecoration.none),
                            ),
                            StatefulBuilder(
                              builder:
                                  (BuildContext context, StateSetter setState) {
                                return Container(
                                  margin:
                                      const EdgeInsets.fromLTRB(0, 20, 0, 0),
                                  height: 150,
                                  width: 450,
                                  child: GridView.count(
                                    crossAxisCount: 10,
                                    shrinkWrap: true,
                                    children: List.generate(
                                        infoClientService.letterReserve.length,
                                        (index) {
                                      return Container(
                                        margin: const EdgeInsets.fromLTRB(
                                            0, 0, 10, 10),
                                        child: TextButton(
                                          style: ButtonStyle(
                                            backgroundColor:
                                                MaterialStatePropertyAll<Color>(
                                                    reserveColors[index][0]),
                                          ),
                                          onPressed: () => {
                                            setState(() => {
                                                  reserveColors =
                                                      _colorChangeReserve(
                                                          reserveColors, index)
                                                }),
                                          },
                                          child: Text(
                                            infoClientService
                                                .letterReserve[index]
                                                .toLowerCase(),
                                            style: TextStyle(
                                              fontSize: 17,
                                              color: reserveColors[index][1],
                                            ),
                                          ),
                                        ),
                                      );
                                    }),
                                  ),
                                );
                              },
                            ),
                            TextButton(
                              onPressed: () => {_makeLetterExchange()},
                              child: const Text('Confirmer'),
                            ),
                          ],
                          if (chosenLetterReserve == '') ...[
                            Text(
                              "Il n'y a pas de lettre disponible dans la reserve.",
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 17,
                                  decoration: TextDecoration.none),
                            ),
                          ],
                          TextButton(
                            onPressed: () => Navigator.pop(context, 'Annuler'),
                            child: const Text('Annuler'),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
          break;
        }
      case EXCHANGE_STAND:
        {
          List<Player> playersExcludingThisClient = [];
          playersExcludingThisClient.addAll(infoClientService.actualRoom.players
              .where((player) => player.name != infoClientService.playerName));
          showDialog(
            context: context,
            builder: (_) => AlertDialog(
              backgroundColor: Theme.of(context).colorScheme.secondary,
              actions: <Widget>[
                Container(
                  margin: const EdgeInsets.fromLTRB(20, 20, 20, 0),
                  height: 350,
                  width: 250,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        "Cliquer sur l'avatar du joueur avec lequel vous voulez échanger votre stand !",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontWeight: FontWeight.bold,
                            fontSize: 17,
                            decoration: TextDecoration.none),
                      ),
                      Container(
                        child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: playersExcludingThisClient.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                margin: const EdgeInsets.fromLTRB(0, 0, 0, 10),
                                child: Row(
                                  children: <Widget>[
                                    IconButton(
                                      iconSize: 50,
                                      icon: CircleAvatar(
                                        radius: 50,
                                        backgroundImage: MemoryImage(
                                          getAvatarFromPlayerUri(
                                              playersExcludingThisClient[index]
                                                  .avatarUri),
                                        ),
                                      ),
                                      onPressed: () {
                                        _onAvatarPressed(
                                            playersExcludingThisClient[index]
                                                .name);
                                      },
                                    ),
                                    TextButton(
                                      onPressed: () {
                                        _onAvatarPressed(
                                            playersExcludingThisClient[index]
                                                .name);
                                      },
                                      child: Text(
                                        playersExcludingThisClient[index].name,
                                        style: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .primary,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }),
                      ),
                      TextButton(
                        onPressed: () => Navigator.pop(context, 'Annuler'),
                        child: const Text('Annuler'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
          break;
        }
      default:
        {
          if (!infoClientService.isTurnOurs) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(
              content: const Text("Ce n'est pas votre tour de jouer."),
              backgroundColor: Colors.red.shade300,
            ));
          } else {
            socketService.socket.emit('powerCardClick', [powerCardName, '']);
          }
          Navigator.pop(context);
          break;
        }
    }
  }

  String? _coordsValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez des coordonnées";
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return "La forme doit être ligne-colonne. Exemple: e10";
    } else {
      int idxLine = value
              .substring(0, END_POSITION_INDEX_LINE)
              .toLowerCase()
              .codeUnitAt(0) -
          ASCII_CODE_SHIFT;
      int idxColumn =
          int.parse(value.substring(END_POSITION_INDEX_LINE, value.length));
      if (idxLine <= 0 ||
          idxColumn <= 0 ||
          idxLine > NUMBER_SQUARE_H_AND_W ||
          idxColumn > NUMBER_SQUARE_H_AND_W) {
        return 'Coordonnées invalides. Le format doit être (ligne-colonne). Exemple: e10';
      }
      if (infoClientService.game.board[idxLine][idxColumn].letter.value != '') {
        return "Cette case n'est pas vide. Veuillez choisir une autre case.";
      }
      if (infoClientService.game.board[idxLine][idxColumn].bonus != 'xx') {
        return 'Cette case possède déjà un bonus. Veuillez choisir une autre case.';
      }
      coords = value;
      return null;
    }
  }

  void _sendCoords() {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Ce n'est pas votre tour de jouer."),
        backgroundColor: Colors.red.shade300,
      ));
    } else if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      if (coords == '') {
        return;
      }
      int idxLine = coords!
              .substring(0, END_POSITION_INDEX_LINE)
              .toLowerCase()
              .codeUnitAt(0) -
          ASCII_CODE_SHIFT;
      int idxColumn =
          int.parse(coords!.substring(END_POSITION_INDEX_LINE, coords!.length));
      socketService.socket
          .emit('powerCardClick', [TRANFORM_EMPTY_TILE, '$idxLine-$idxColumn']);
      infoClientService.powerUsedForTurn = true;
    } else {
      return;
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  void _makeLetterExchange() {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Ce n'est pas votre tour de jouer."),
        backgroundColor: Colors.red.shade300,
      ));
    } else {
      String additionalParams =
          chosenLetterReserve + idxChosenLetterStand.toString();
      socketService.socket
          .emit('powerCardClick', [EXCHANGE_LETTER_JOKER, additionalParams]);
      infoClientService.powerUsedForTurn = true;
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  void _onAvatarPressed(String playerName) {
    if (!infoClientService.isTurnOurs) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Ce n'est pas votre tour de jouer."),
        backgroundColor: Colors.red.shade300,
      ));
    } else {
      infoClientService.powerUsedForTurn = true;
      socketService.socket.emit('powerCardClick', [EXCHANGE_STAND, playerName]);
    }
    Navigator.pop(context);
    Navigator.pop(context);
  }

  Uint8List getAvatarFromPlayerUri(String avatarUri) {
    return base64Decode(avatarUri.substring(22));
  }

  List<List<Color>> _colorChangeStand(List<List<Color>> colorStand, int index) {
    List<List<Color>> newColorStand = initStandColors();
    Color backGroundColorSave = colorStand[index][0];
    newColorStand[index][0] = colorStand[index][1];
    newColorStand[index][1] = backGroundColorSave;
    idxChosenLetterStand = index;
    return newColorStand.toList();
  }

  List<List<Color>> _colorChangeReserve(
      List<List<Color>> colorReserve, int index) {
    List<List<Color>> newColorReserve = initReserveColors();
    Color backGroundColorSave = colorReserve[index][0];
    newColorReserve[index][0] = colorReserve[index][1];
    newColorReserve[index][1] = backGroundColorSave;
    chosenLetterReserve = infoClientService.letterReserve[index].toLowerCase();
    return newColorReserve.toList();
  }

  List<List<Color>> initStandColors() {
    return [
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
    ].toList();
  }

  List<List<Color>> initReserveColors() {
    return [
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
      [
        Theme.of(context).colorScheme.primary,
        Theme.of(context).colorScheme.secondary
      ],
    ].toList();
  }
}
