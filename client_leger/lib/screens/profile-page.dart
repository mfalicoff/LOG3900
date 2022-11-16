import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:image_picker/image_picker.dart';
import 'package:client_leger/utils/utils.dart';

import '../env/environment.dart';

class ProfilePage extends StatefulWidget {
  final List<GameSaved> favouriteGames;

  const ProfilePage({
      Key? key,
      required this.favouriteGames,
      }) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfileStatePage();
}

class _ProfileStatePage extends State<ProfilePage> {
  final Controller controller = Controller();
  final String? serverAddress = Environment().config?.serverURL;

  refresh() async {
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 80.0, horizontal: 100.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    color: Theme.of(context).colorScheme.secondary,
                    borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary,
                        width: 3)),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 40.0),
                child: Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(
                            globals.userLoggedIn.getUriFromAvatar()),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        children: [
                            UsernameChangeDialog(
                                notifyParent: refresh,
                            ),
                            Text(globals.userLoggedIn.username,
                                style: const TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.bold,
                                fontSize: 17,
                                decoration: TextDecoration.none)),
                            AvatarChangeDialog(
                                notifyParent: refresh,
                            ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.only(top: 15, bottom: 30),
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
                            TableRow(
                              children: [
                                returnRowTextElement(globals
                                    .userLoggedIn.gamesPlayed
                                    .toString()),
                                returnRowTextElement(
                                    globals.userLoggedIn.gamesWon.toString()),
                                returnRowTextElement(globals
                                    .userLoggedIn.averagePointsPerGame!
                                    .toStringAsFixed(2)),
                                returnRowTextElement(Duration(
                                        milliseconds: globals
                                            .userLoggedIn.averageTimePerGame!
                                            .round())
                                    .toString()),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                            returnHistoryScrollView('Historique des Connections',
                                    globals.userLoggedIn.actionHistory!),
                            returnHistoryScrollView('Historique des Parties',
                                    globals.userLoggedIn.gameHistory!),
                            returnFavouriteGamesScrollView('Parties favorites'),
                        ],
                      )
                    ],
                  ),
                ),
              ),
            )),
      ],
    );
  }

  Text returnRowTextElement(String textData) {
    return Text((textData),
        style: const TextStyle(
            color: Colors.black,
            fontSize: 11,
            decoration: TextDecoration.none));
  }

  Column returnHistoryScrollView(String title, List<dynamic> history) {
    return Column(
      children: [
        SingleChildScrollView(
          child: Column(
            children: [
              Text(title,
                  style: const TextStyle(
                      color: Colors.black,
                      fontSize: 11,
                      decoration: TextDecoration.none)),
              Container(
                decoration: BoxDecoration(border: Border.all()),
                height: 250,
                width: 300,
                child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: history.length,
                    itemBuilder: (BuildContext context, int index) {
                      return Text('\u2022 ${history[index]}',
                          style: const TextStyle(
                              color: Colors.black,
                              fontSize: 11,
                              decoration: TextDecoration.none));
                    }),
              )
            ],
          ),
        ),
      ],
    );
  }

  Column returnFavouriteGamesScrollView(String title) {
    return Column(
        children: [
            SingleChildScrollView(
                child: Column(
                    children: [
                        Text(title,
                            style: const TextStyle(
                            color: Colors.black,
                            fontSize: 11,
                            decoration: TextDecoration.none)),
                        Container(
                            decoration: BoxDecoration(border: Border.all()),
                            height: 250,
                            width: 325,
                            child: ListView.builder(
                                itemCount: widget.favouriteGames.length,
                                itemBuilder: (BuildContext context, int index) {
                                    return Column(
                                        children: [
                                          Text('.Salle: ${widget.favouriteGames[index].roomName}',
                                              style: const TextStyle (
                                              color: Colors.black,
                                              fontSize: 11,
                                              decoration: TextDecoration.none)
                                           ),
                                          Text('.Gagnant de la partie: ${widget.favouriteGames[index].winners[0]}',
                                              style: const TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),
                                          Text('.Nombre de lettres restantes dans la reserve: ${widget.favouriteGames[index].nbLetterReserve}',
                                              style: const TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),
                                          Text('.Nombre de tours total: ${widget.favouriteGames[index].numberOfTurns}',
                                              style: const TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),
                                          Text('.Duree de la partie (en minutes): ${widget.favouriteGames[index].playingTime}',
                                              style: const TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),
                                          Text('.Date de creation de la salle: ${widget.favouriteGames[index].gameStartDate}',
                                              style: const TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),
                                          const Text('-------------------------------------------',
                                              style: TextStyle (
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration: TextDecoration.none)
                                          ),

                                        ],
                                    );
                                }),
                        ),
                    ],
                ),
            )
        ],
    );
  }
}

class UsernameChangeDialog extends StatefulWidget {
  final Function() notifyParent;

  const UsernameChangeDialog({super.key, required this.notifyParent});

  @override
  State<UsernameChangeDialog> createState() => _UsernameChangeDialog();
}

class _UsernameChangeDialog extends State<UsernameChangeDialog> {
  final _formKey = GlobalKey<FormState>();
  late String? newName = "";
  Controller controller = Controller();

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('Modification nom'),
          content: const Text('Veuillez rentrer le nouveau nom'),
          backgroundColor: Theme.of(context).colorScheme.secondary,
          actions: <Widget>[
            Form(
              key: _formKey,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.start,
                children: [
                  TextFormField(
                    onSaved: (String? value) {
                      newName = value;
                    },
                    validator: _usernameValidator,
                    decoration: InputDecoration(
                      border: const OutlineInputBorder(),
                      labelText: "Nouveau Pseudonyme",
                      labelStyle: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                    ),
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  ),
                  TextButton(
                    onPressed: () => Navigator.pop(context, 'Cancel'),
                    child: const Text('Cancel'),
                  ),
                  TextButton(
                    onPressed: _changeName,
                    child: const Text('Soumettre'),
                  ),
                ],
              ),
            )
          ],
        ),
      ),
      child: const Text('Edit name'),
    );
  }

  String? _usernameValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez un pseudonyme";
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return "Rentrez un pseudonyme avec des charactères alphanumériques";
    } else {
      return null;
    }
  }

  Future<void> _changeName() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      try {
        final oldCookie = globals.userLoggedIn.cookie;
        globals.userLoggedIn = await controller.updateName(newName!);
        globals.userLoggedIn.cookie = oldCookie;
        widget.notifyParent();
        if (!mounted) return;
        Navigator.pop(context, 'Submit');
      } on Exception {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text("Erreur"),
          backgroundColor: Colors.red.shade300,
        ));
      }
    }
  }
}

class AvatarChangeDialog extends StatefulWidget {
  final Function() notifyParent;

  const AvatarChangeDialog({super.key, required this.notifyParent});

  @override
  State<AvatarChangeDialog> createState() => _AvatarChangeDialog();
}

class _AvatarChangeDialog extends State<AvatarChangeDialog> {
  late String? newName = "";
  Controller controller = Controller();
  final String? serverAddress = Environment().config?.serverURL;
  late List<dynamic> avatars;

  @override
  initState() {
    super.initState();
    http
        .get(
          Uri.parse("$serverAddress/avatar"),
        )
        .then((res) => parseAvatars(res));
  }

  parseAvatars(http.Response res) {
    var parsed = jsonDecode(res.body);
    avatars = parsed["data"] ?? "Failed";
  }

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
          context: context,
          builder: (BuildContext context) {
            File? cameraImageFile;
            return StatefulBuilder(builder: (context, setState) {
              return AlertDialog(
                title: const Text('Modifier Avatar'),
                content:
                    const Text('Selectionner avatar voulu ou prenez une photo'),
                backgroundColor: Theme.of(context).colorScheme.secondary,
                actions: <Widget>[
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: <Widget>[
                      Container(
                        decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(100),
                            border: Border.all(width: 2, color: Colors.white)),
                        child: IconButton(
                            onPressed: () async {
                              PickedFile? pickedFile =
                                  await ImagePicker().getImage(
                                source: ImageSource.camera,
                                maxWidth: 1800,
                                maxHeight: 1800,
                              );
                              if (pickedFile != null) {
                                setState(() =>
                                    {cameraImageFile = File(pickedFile.path)});
                              }
                            },
                            icon: const Icon(Icons.camera_alt_rounded)),
                      )
                    ],
                  ),
                  Container(
                      child: cameraImageFile == null
                          ? Column(
                              children: [
                                Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      avatarPicker(0),
                                      avatarPicker(2),
                                      avatarPicker(4),
                                      avatarPicker(6),
                                    ]),
                                Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      avatarPicker(1),
                                      avatarPicker(3),
                                      avatarPicker(5),
                                      avatarPicker(7),
                                    ]),
                              ],
                            )
                          : Column(
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(10.0),
                                      child: CircleAvatar(
                                        radius: 100,
                                        backgroundImage:
                                            FileImage(cameraImageFile as File),
                                      ),
                                    )
                                  ],
                                ),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  crossAxisAlignment: CrossAxisAlignment.center,
                                  children: [
                                    TextButton(
                                      onPressed: (() => setState(
                                          () => cameraImageFile = null)),
                                      child: const Text('Annuler'),
                                    ),
                                  ],
                                ),
                                TextButton(
                                  onPressed: (() => _changeAvatarFromCamera(
                                      cameraImageFile as File)),
                                  child: const Text('Soumettre'),
                                ),
                              ],
                            )),
                ],
              );
            });
          }),
      child: const Text('Edit avatar'),
    );
  }

  GestureDetector avatarPicker(int index) {
    return (GestureDetector(
        onTap: () {
          changeAvatar(index + 1);
        },
        child: getAvatarFromString(48, avatars[index]['uri'])));
  }

  Future<void> _changeAvatarFromCamera(File image) async {
    try {
      final oldCookie = globals.userLoggedIn.cookie;
      globals.userLoggedIn = await controller.updateAvatarFromCamera(image);
      globals.userLoggedIn.cookie = oldCookie;
      widget.notifyParent();
      if (!mounted) return;
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Erreur"),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }

  Future<void> changeAvatar(int index) async {
    try {
      final oldCookie = globals.userLoggedIn.cookie;
      globals.userLoggedIn =
          await controller.updateAvatar('avatar${index.toString()}');
      globals.userLoggedIn.cookie = oldCookie;
      widget.notifyParent();
      if (!mounted) return;
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Erreur"),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }
}
