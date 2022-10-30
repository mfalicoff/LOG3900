import 'dart:ui';

import 'package:client_leger/models/power-cards.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

class CreateGamePage extends StatefulWidget {
  const CreateGamePage({Key? key}) : super(key: key);

  @override
  State<CreateGamePage> createState() => _CreateGamePageState();
}

class _CreateGamePageState extends State<CreateGamePage> {
  late String? roomName = "";
  late double? turnTime = 1;
  final _formKey = GlobalKey<FormState>();
  final SocketService socketService = SocketService();
  final InfoClientService gameService = InfoClientService();

  @override
  void initState() {
    socketService.socket.on("roomChangeAccepted", (data) {
      if(mounted){
        FocusScope.of(context).unfocus();
        Navigator.pushNamed(context, "/game");
      }
    });
    super.initState();
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
                const EdgeInsets.symmetric(vertical: 100.0, horizontal: 200.0),
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
                        height: 30.0,
                      ),
                      Form(
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
                                    color:
                                        Theme.of(context).colorScheme.primary),
                              ),
                              style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary),
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
                            ElevatedButton(
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
                          ],
                        ),
                      ),
                      const SizedBox(
                        height: 25.0,
                      ),
                      Expanded(
                        child: Container(),
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
      socketService.socket.emit("createRoomAndGame",
          CreateGameModel(roomName!, globals.userLoggedIn.username, turnTime!)
      );
    }
  }
}

class CreateGameModel{
  late String roomName;
  late String playerName;
  late double timeTurn;
  final String gameMode = "Multi";
  final bool isGamePrivate = false;
  final String passwd = "";
  final List<PowerCard> activatedPowers = [];

  Map<String, dynamic> toJson(){
    return {
      'roomName': roomName,
      'playerName': playerName,
      'timeTurn': timeTurn,
      'gameMode': gameMode,
      'isGamePrivate' : isGamePrivate,
      'passwd' : passwd,
      'activatedPowers': activatedPowers,
    };
  }

  CreateGameModel(this.roomName, this.playerName, this.timeTurn);
}
