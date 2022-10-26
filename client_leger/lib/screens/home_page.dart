import 'package:client_leger/screens/profile-page.dart';
import 'package:client_leger/screens/search_page.dart';
import 'package:client_leger/services/controller.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;


class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

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
            top: 100.0,
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
                onPressed: _toSearchPage,
                child: const Icon(Icons.search))),
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
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              GestureDetector(
                onTap: _toProfilePage,
                child: CircleAvatar(
                  radius: 48,
                  backgroundImage: MemoryImage(globals.userLoggedIn.getUriFromAvatar()),
                ),
              ),

              Text(
                globals.userLoggedIn.username,
                style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 17, decoration: TextDecoration.none)
              )
            ],
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
            ],
          ),
        ),
      ],
    );
  }

  void _toChatPage() {
    Navigator.of(context).pushNamed('/chat');
  }

  void _toSearchPage() {
    Navigator.push(context, MaterialPageRoute(builder: (context) => const SearchPage())).then((value) {
      setState(() {
      });
    });
  }

  void _toProfilePage() {
    Navigator.push(context, MaterialPageRoute(builder: (context) => const ProfilePage())).then((value) {
      setState(() {
      });
    });
  }

  void _toGameListPage() {
    Navigator.pushNamed(context, "/game-list");
  }

  void _logout() {
    controller.logout(globals.userLoggedIn);
    Navigator.of(context).pop();
  }
}
