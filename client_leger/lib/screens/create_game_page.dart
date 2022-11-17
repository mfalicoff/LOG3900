import 'dart:ui';

import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:client_leger/constants/constants.dart';
import 'package:flip_card/flip_card.dart';
import '../models/mock_dict.dart';

List<bool> activatedPowerCards = [
  true, true, true, true,
  true, true, true, true,
];

class CreateGamePage extends StatefulWidget {
  const CreateGamePage({Key? key}) : super(key: key);

  @override
  State<CreateGamePage> createState() => _CreateGamePageState();
}

class _CreateGamePageState extends State<CreateGamePage> {
  late String? roomName = "";
  late double? turnTime = 1;
  late MockDict? dictionary;
  late bool? _isGamePrivate = false;
  late String? password = "";
  late bool? isPasswordOn = false;
  final _formKey = GlobalKey<FormState>();
  final SocketService socketService = SocketService();
  final InfoClientService infoClientService = InfoClientService();

  @override
  void initState() {
    dictionary = infoClientService.dictionaries[0];
    socketService.socket.on("roomChangeAccepted", (data) {
      if (mounted) {
        FocusScope.of(context).unfocus();
        Navigator.pushNamed(context, "/game");
      }
    });
    socketService.socket.on('messageServer', (message) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: Text(message),
        backgroundColor: Colors.red.shade300,
      ));
    });
    super.initState();
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
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 50.0, horizontal: 200.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  color: Theme.of(context).colorScheme.secondary,
                  borderRadius: const BorderRadius.all(
                    Radius.circular(20.0),
                  ),
                  border: Border.all(
                      color: Theme.of(context).colorScheme.primary, width: 3),
                ),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 25.0),
                child: Center(
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.start,
                        children: [
                          IconButton(
                            onPressed: _goBackGameListPage,
                            icon: Icon(
                              Icons.arrow_back,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(
                            width: 315,
                          ),
                          Column(
                            children: [
                              Icon(
                                Icons.person,
                                color: Theme.of(context).colorScheme.primary,
                              ),
                              Text(
                                "${globals.userLoggedIn.username} (Vous)",
                                style: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.primary),
                              ),
                            ],
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 10.0,
                      ),
                      Expanded(
                        child: SingleChildScrollView(
                          child: Container(
                            padding:
                                const EdgeInsets.symmetric(horizontal: 150),
                            child: Form(
                              key: _formKey,
                              child: Column(
                                children: [
                                  TextFormField(
                                    onSaved: (String? value) {
                                      roomName = value;
                                    },
                                    validator: _roomNameValidator,
                                    decoration: InputDecoration(
                                      border: const OutlineInputBorder(),
                                      labelText: "Nom de la salle",
                                      labelStyle: TextStyle(
                                          color: Theme.of(context)
                                              .colorScheme
                                              .primary),
                                    ),
                                    style: TextStyle(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary),
                                  ),
                                  const SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    children: [
                                      Text("Mode de partie:"),
                                      Expanded(
                                        child: ListTile(
                                          title: const Text("Publique"),
                                          leading: Radio(
                                            value: false,
                                            groupValue: _isGamePrivate,
                                            onChanged: (bool? value) {
                                              setState(() {
                                                _isGamePrivate = value;
                                              });
                                            },
                                          ),
                                        ),
                                      ),
                                      Expanded(
                                        child: ListTile(
                                          title: const Text("Privée"),
                                          leading: Radio(
                                            value: true,
                                            groupValue: _isGamePrivate,
                                            onChanged: (bool? value) {
                                              setState(() {
                                                _isGamePrivate = value;
                                              });
                                            },
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(
                                    height: 5,
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Checkbox(
                                          value: isPasswordOn,
                                          onChanged: (bool? value) {
                                            setState(() {
                                              isPasswordOn = value;
                                            });
                                          }),
                                      const Text("Mot de passe"),
                                      const SizedBox(width: 10,),
                                      if (isPasswordOn!)
                                        Expanded(
                                            child: TextFormField(
                                          onSaved: (String? value) {
                                            password = value;
                                          },
                                          validator: _roomNameValidator,
                                          decoration: InputDecoration(
                                            border: const OutlineInputBorder(),
                                            labelText: "Mot de passe",
                                            labelStyle: TextStyle(
                                                color: Theme.of(context)
                                                    .colorScheme
                                                    .primary),
                                          ),
                                          style: TextStyle(
                                              color: Theme.of(context)
                                                  .colorScheme
                                                  .primary),
                                        ))
                                      else
                                        Container(),
                                    ],
                                  ),
                                  const SizedBox(
                                    height: 10,
                                  ),
                                  DropdownButtonFormField<double>(
                                    value: turnTime,
                                    items: const [
                                      DropdownMenuItem<double>(
                                        value: 0.5,
                                        child: Text("30sec"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 1,
                                        child: Text("1min"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 1.5,
                                        child: Text("1min 30sec"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 2,
                                        child: Text("2min"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 2.5,
                                        child: Text("2min 30sec"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 3,
                                        child: Text("3min"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 3.5,
                                        child: Text("3min 30sec"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 4,
                                        child: Text("4min"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 4.5,
                                        child: Text("4min 30sec"),
                                      ),
                                      DropdownMenuItem<double>(
                                        value: 5,
                                        child: Text("5min"),
                                      ),
                                    ],
                                    onChanged: (double? value) {
                                      turnTime = value;
                                    },
                                  ),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  DropdownButtonFormField<MockDict>(
                                    items: List<DropdownMenuItem<MockDict>>.generate(
                                        infoClientService.dictionaries.length,
                                        (int index) => DropdownMenuItem(
                                              child: Text(infoClientService.dictionaries[index].title),
                                            )),
                                    onChanged: (MockDict? value) {
                                      dictionary = value;
                                    },
                                  ),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  if (dictionary != null)
                                    Text(dictionary!.description)
                                  else
                                    Container(),
                                  const SizedBox(
                                    height: 25,
                                  ),
                                  if(infoClientService.gameMode == POWER_CARDS_MODE)...[
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.center,
                                      children: [
                                        const Text("Activer/desactiver des carte de pouvoir :"),
                                        PowerListDialog(
                                          notifyParent: refresh,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(
                                      height: 25,
                                    ),
                                  ],
                                  ElevatedButton(
                                    style: ButtonStyle(
                                      padding: MaterialStateProperty.all(
                                        const EdgeInsets.symmetric(
                                            vertical: 18.0, horizontal: 40.0),
                                      ),
                                      shape: MaterialStateProperty.all<
                                          RoundedRectangleBorder>(
                                        RoundedRectangleBorder(
                                          borderRadius:
                                              BorderRadius.circular(10.0),
                                        ),
                                      ),
                                    ),
                                    onPressed: _start,
                                    child: Text(
                                      "Démarrer",
                                      style: TextStyle(
                                          fontSize: 20,
                                          color: Theme.of(context).colorScheme.secondary
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          )
        ],
      ),
    );
  }

  String? _roomNameValidator(String? value) {
    final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
    if (value == null || value.isEmpty) {
      return "Rentrez un nom de salle";
    } else if (value.length < 4 ||
        value.length > 19 ||
        !validCharacters.hasMatch(value)) {
      return "Nom de salle non valide";
    } else {
      return null;
    }
  }

  void _goBackGameListPage() {
    Navigator.pop(context);
  }

  void _start() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      infoClientService.isGamePrivate = _isGamePrivate;
      socketService.socket.emit(
          "createRoomAndGame",
          CreateGameModel(roomName!, globals.userLoggedIn.username, turnTime!,
              infoClientService.gameMode, _isGamePrivate!, password!, activatedPowerCards));
      socketService.socket.emit("dictionarySelected", dictionary);
    }
  }
}

class CreateGameModel {
  late String roomName;
  late String playerName;
  late double timeTurn;
  late String gameMode;
  late List<bool> activatedPowers;
  late bool isGamePrivate = false;
  late String passwd = "";

  Map<String, dynamic> toJson() {
    return {
      'roomName': roomName,
      'playerName': playerName,
      'timeTurn': timeTurn,
      'gameMode': gameMode,
      'isGamePrivate': isGamePrivate,
      'passwd': passwd,
      'activatedPowers': activatedPowers,
    };
  }

  CreateGameModel(
      this.roomName, this.playerName, this.timeTurn, this.gameMode,
      this.isGamePrivate, this.passwd, this.activatedPowers);
}

class PowerListDialog extends StatefulWidget {
  final Function() notifyParent;

  const PowerListDialog({super.key, required this.notifyParent});

  @override
  State<PowerListDialog> createState() => _PowerListDialog();
}

class _PowerListDialog extends State<PowerListDialog> {
  InfoClientService infoClientService = InfoClientService();
  SocketService socketService = SocketService();

  @override
  Widget build(BuildContext context) {
    infoClientService.game.initPowerCards();
    return TextButton(
      onPressed: () =>
          showDialog<String>(
            context: context,
            builder: (BuildContext context) =>
                AlertDialog(
                  backgroundColor: Theme.of(context).colorScheme.secondary,
                  actions: <Widget>[
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text('Cartes disponibles',
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                              decoration: TextDecoration.none
                          ),
                        ),
                        Container(
                          margin: const EdgeInsets.fromLTRB(10, 10, 10, 0),
                          height: 450,
                          width: 300,
                          child: ListView.builder(
                            shrinkWrap: true,
                            itemCount: infoClientService.game.powerCards.length,
                            itemBuilder: (BuildContext context, int index) {
                              return Container(
                                child: Row(
                                  children: <Widget>[
                                    FlipCard(
                                      direction: FlipDirection.HORIZONTAL,
                                      front: const SizedBox(
                                        width: 50,
                                        height: 50,
                                        // color: Colors.red,
                                        child: Image(image: AssetImage("assets/card.png")),
                                      ),
                                      back: Container(
                                        decoration: BoxDecoration(
                                          color: Theme.of(context).colorScheme.primary,
                                          borderRadius: const BorderRadius.all(Radius.circular(5)),
                                        ),
                                        width: 200,
                                        height: 50,
                                        margin: const EdgeInsets.fromLTRB(0, 0, 40, 5),
                                        // color: Theme.of(context).colorScheme.primary,
                                        child: Padding(
                                          padding: const EdgeInsets.fromLTRB(5, 5, 5, 5),
                                          child: Text(
                                            infoClientService.game.powerCards[index].name,
                                            style: TextStyle(
                                              fontSize: 10.0,
                                              color: Theme.of(context).colorScheme.secondary,
                                            ),
                                            textAlign: TextAlign.justify,
                                          ),
                                        ),
                                      ),
                                    ),
                                    StatefulBuilder(
                                      builder: (BuildContext context, StateSetter setState) {
                                        return Checkbox(
                                          value: activatedPowerCards[index],
                                          onChanged: (bool? value) {
                                            setState(() {
                                              activatedPowerCards[index] =
                                              !activatedPowerCards[index];
                                            });
                                          },
                                        );
                                      },
                                    ),
                                  ],
                                ),
                              );
                            }
                          ),
                        ),
                        TextButton(
                          onPressed: () => Navigator.pop(context, 'Confirmer'),
                          child: const Text('Confirmer'),
                        ),
                      ],
                    ),
                  ],
                ),
          ),
      style: ButtonStyle(
        backgroundColor: MaterialStatePropertyAll<Color>(Theme
            .of(context)
            .colorScheme
            .primary),
        padding: MaterialStateProperty.all(
          const EdgeInsets.symmetric(
              vertical: 6.0, horizontal: 6.0),
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
          color: Theme
              .of(context)
              .colorScheme
              .secondary,
        ),
      ),
    );
  }
}

