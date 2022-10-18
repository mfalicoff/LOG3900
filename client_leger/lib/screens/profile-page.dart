import 'dart:ui';

import 'package:client_leger/services/controller.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

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
      child: const Text('Show Dialog'),
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
