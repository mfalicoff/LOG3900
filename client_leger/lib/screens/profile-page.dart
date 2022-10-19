import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:client_leger/services/controller.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:http/http.dart';
import 'package:image_picker/image_picker.dart';

import '../env/environment.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  @override
  State<ProfilePage> createState() => _ProfileStatePage();
}

class _ProfileStatePage extends State<ProfilePage> {
  final Controller controller = Controller();

  refresh() {
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
                const EdgeInsets.symmetric(vertical: 100.0, horizontal: 200.0),
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
                    vertical: 25.0, horizontal: 250.0),
                child: Center(
                  child: Column(
                    children: [
                      CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(
                            globals.userLoggedIn.getUriFromAvatar()),
                      ),
                      Text(globals.userLoggedIn.username,
                          style: const TextStyle(
                              color: Colors.black,
                              fontWeight: FontWeight.bold,
                              fontSize: 17,
                              decoration: TextDecoration.none)),
                      DialogExample(
                        notifyParent: refresh,
                      ),
                      DialogExample1(
                        notifyParent: refresh,
                      ),
                      Container(
                        padding: const EdgeInsets.only(top: 50, bottom: 50),
                        child: Table(
                          children: const [
                            TableRow(
                              children: [
                                Text('Parties jouees',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('Parties gagnes',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('Score moyen par partie',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('Temps moyen par partie',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                              ],
                            ),
                            TableRow(
                              children: [
                                Text('1',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('1',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('1',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                                Text('1',
                                    style: TextStyle(
                                        color: Colors.black,
                                        fontSize: 11,
                                        decoration: TextDecoration.none)),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Column(children: [
                            SingleChildScrollView(
                              child: Column(
                                children: [
                                  const Text('Historique des Connections',
                                      style: TextStyle(
                                          color: Colors.black,
                                          fontSize: 11,
                                          decoration: TextDecoration.none)),
                                  Container(
                                    decoration:
                                        BoxDecoration(border: Border.all()),
                                    margin: const EdgeInsets.all(5.0),
                                    height: 100,
                                    width: 200,
                                    child: ListView.builder(
                                        shrinkWrap: true,
                                        itemCount: globals
                                            .userLoggedIn.actionHistory?.length,
                                        itemBuilder:
                                            (BuildContext context, int index) {
                                          return Text(
                                              '\u2022 ${globals.userLoggedIn.actionHistory![index]}',
                                              style: const TextStyle(
                                                  color: Colors.black,
                                                  fontSize: 11,
                                                  decoration:
                                                      TextDecoration.none));
                                        }),
                                  )
                                ],
                              ),
                            ),
                          ]),
                          Column(
                            children: [
                              SingleChildScrollView(
                                child: Column(
                                  children: [
                                    const Text('Historique des Parties',
                                        style: TextStyle(
                                            color: Colors.black,
                                            fontSize: 11,
                                            decoration: TextDecoration.none)),
                                    Container(
                                      decoration:
                                          BoxDecoration(border: Border.all()),
                                      height: 100,
                                      width: 200,
                                      child: ListView.builder(
                                          shrinkWrap: true,
                                          itemCount: globals.userLoggedIn
                                              .actionHistory?.length,
                                          itemBuilder: (BuildContext context,
                                              int index) {
                                            return Text(
                                                '\u2022 ${globals.userLoggedIn.actionHistory![index]}',
                                                style: const TextStyle(
                                                    color: Colors.black,
                                                    fontSize: 11,
                                                    decoration:
                                                        TextDecoration.none));
                                          }),
                                    )
                                  ],
                                ),
                              ),
                            ],
                          )
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
}

class DialogExample extends StatefulWidget {
  final Function() notifyParent;

  const DialogExample({super.key, required this.notifyParent});

  @override
  State<DialogExample> createState() => _DialogStateExample();
}

class _DialogStateExample extends State<DialogExample> {
  late String? newName = "";
  Controller controller = Controller();

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) => AlertDialog(
          title: const Text('AlertDialog Title'),
          content: const Text('AlertDialog description'),
          actions: <Widget>[
            TextField(
              onChanged: (text) {
                newName = text;
              },
              decoration: InputDecoration(
                border: const OutlineInputBorder(),
                labelText: "Nouveau nom",
                labelStyle:
                    TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            TextButton(
              onPressed: () => Navigator.pop(context, 'Cancel'),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: _changeName,
              child: const Text('Submit'),
            ),
          ],
        ),
      ),
      child: const Text('Edit name'),
    );
  }

  Future<void> _changeName() async {
    try {
      final oldCookie = globals.userLoggedIn.cookie;
      globals.userLoggedIn = await controller.updateName(newName!);
      globals.userLoggedIn.cookie = oldCookie;
      widget.notifyParent();
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Erreur"),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }
}

class DialogExample1 extends StatefulWidget {
  final Function() notifyParent;

  const DialogExample1({super.key, required this.notifyParent});

  @override
  State<DialogExample1> createState() => _DialogStateExample1();
}

class _DialogStateExample1 extends State<DialogExample1> {
  late String? newName = "";
  Controller controller = Controller();
  final String? serverAddress = Environment().config?.serverURL;
  late List<dynamic> avatars;
  File? imageFile;

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

  _getFromCamera() async {
    PickedFile? pickedFile = await ImagePicker().getImage(
      source: ImageSource.camera,
      maxWidth: 1800,
      maxHeight: 1800,
    );
    if (pickedFile != null) {
        imageFile = File(pickedFile.path);
    }
  }

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: () => showDialog<String>(
          context: context,
          builder: (BuildContext context) {
            File? imageFile;
            return StatefulBuilder(builder: (context, setState) {
              return AlertDialog(
                title: const Text('AlertDialog Title'),
                content: const Text('AlertDialog description'),
                actions: <Widget>[
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[0]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[2]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[4]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[6]['uri']?.substring(22) as String)),
                      ),
                    ),
                  ]),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[1]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[3]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[5]['uri']?.substring(22) as String)),
                      ),
                    ),
                    GestureDetector(
                      onTap: () {
                        print('dhbsajdhgsakj');
                        changeAvatar('1');
                      },
                      child: CircleAvatar(
                        radius: 48,
                        backgroundImage: MemoryImage(base64Decode(
                            avatars[7]['uri']?.substring(22) as String)),
                      ),
                    ),
                  ]),
                  Container(
                    child: imageFile == null
                        ? Container()
                        : Container(
                            child: CircleAvatar(
                              radius: 100,
                              backgroundImage: FileImage(imageFile as File),
                            ),
                          ),
                  ),
                  MaterialButton(
                      color: Colors.blue,
                      child: const Text("Pick Image from Camera",
                          style: TextStyle(
                              color: Colors.white70,
                              fontWeight: FontWeight.bold)),
                      onPressed: () async {
                        PickedFile? pickedFile = await ImagePicker().getImage(
                          source: ImageSource.camera,
                          maxWidth: 1800,
                          maxHeight: 1800,
                        );
                        if (pickedFile != null) {
                          setState(() => {imageFile = File(pickedFile.path)});
                        }
                      }),
                  TextButton(
                    onPressed: (() => _changeAvatarFromCamera(imageFile as File)),
                    child: const Text('Submit'),
                  ),
                ],
              );
            });
          }),
      child: const Text('Edit avatar'),
    );
  }

  Future<void> _changeAvatarFromCamera(File image) async {
    try {
      globals.userLoggedIn = await controller.updateAvatarFromCamera(image);
      widget.notifyParent();
      Navigator.pop(context, 'Submit');
    } on Exception {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
        content: const Text("Erreur"),
        backgroundColor: Colors.red.shade300,
      ));
    }
  }

  changeAvatar(String s) {
    print('Avatar Change');
  }
}
