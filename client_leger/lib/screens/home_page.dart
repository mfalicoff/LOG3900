import 'package:client_leger/services/controller.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

import 'game_list_page.dart';
import 'game_page.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final Controller controller = Controller();

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
        ),
        Positioned(
            top: 10.0,
            right: 30.0,
            child: ElevatedButton(
                style: ButtonStyle(
                    padding: MaterialStateProperty.all(
                      const EdgeInsets.symmetric(
                          vertical: 18.0, horizontal: 0.0),
                    ),
                    shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                        RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(100.0)))),
                onPressed: _toChatPage,
                child: const Icon(Icons.chat))),
        Positioned(
          top: 10.0,
          left: 30.0,
          child: ElevatedButton(
            style: ButtonStyle(
              padding: MaterialStateProperty.all(
                const EdgeInsets.symmetric(vertical: 6.0, horizontal: 0.0),
              ),
              shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10.0),
                ),
              ),
            ),
            onPressed: _logout,
            child: const Icon(Icons.logout),
          ),
        ),
        Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              ElevatedButton(
                onPressed: _toGameListPage,
                child: const Text("Mode Classique"),
              ),
              ElevatedButton(
                onPressed: _toGamePageState,
                child: const Text("Go to Game Board (tmpButton)"),
              ),
            ],
          ),
        ),
      ],
    );
  }

  void _toChatPage() {
    Navigator.of(context).pushNamed('/chat');
  }

  void _toGameListPage() {
    Navigator.of(context)
        .push(MaterialPageRoute(builder: (context) => const GameListPage()));
  }
  void _toGamePageState() {
    Navigator.of(context)
        .push(MaterialPageRoute(builder: (context) => const GamePage()));
  }

  void _logout() {
    controller.logout(globals.userLoggedIn);
    Navigator.of(context).pop();
  }
}
