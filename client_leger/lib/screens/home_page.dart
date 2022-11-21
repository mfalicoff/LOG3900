import 'dart:convert';

import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/screens/profile-page.dart';
import 'package:client_leger/screens/search_page.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/tapService.dart';
import '../constants/constants.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:http/http.dart' as http;

import '../services/chat-service.dart';
import '../env/environment.dart';
import '../widget/chat_panel.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({Key? key}) : super(key: key);

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  final Controller controller = Controller();
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();
  final TapService tapService = TapService();
  late List<GameSaved> games = [];
  final String? serverAddress = Environment().config?.serverURL;
  ChatService chatService = ChatService();

    @override
  void initState() {
    super.initState();
    final user = globals.userLoggedIn;
    http.get(Uri.parse("$serverAddress/users/games/${user.id}"))
        .then((res) => parseGames(res));
  }

  void parseGames(http.Response res) {
    var parsed = json.decode(res.body);
    for (var game in parsed) {
      games.add(GameSaved.fromJson(game));
    }
  }

  refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    socketService.socket.emit('getAllChatRooms');
    return Scaffold(
      endDrawer: Drawer(
          width: 600,
          child: ChatPanel(
            isInGame: false,
          )),
      onEndDrawerChanged: (isOpen) {
        chatService.isDrawerOpen = isOpen;
        chatService.notifyListeners();
      },
      body: Stack(
        children: <Widget>[
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
          ),
          const Positioned(
              top: 10.0, right: 30.0, child: ChatPanelOpenButton()),
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
        //   Positioned(
        //     top: 20.0,
        //     left: 30.0,
        //     child: ElevatedButton(
        //       style: ButtonStyle(
        //         padding: MaterialStateProperty.all(
        //           const EdgeInsets.symmetric(vertical: 6.0, horizontal: 0.0),
        //         ),
        //         shape: MaterialStateProperty.all<RoundedRectangleBorder>(
        //           RoundedRectangleBorder(
        //             borderRadius: BorderRadius.circular(10.0),
        //           ),
        //         ),
        //       ),
        //       onPressed: () { alert },
        //       child: const Icon(Icons.read_more),
        //     ),
        //   ),
          Center(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                GestureDetector(
                  onTap: _toProfilePage,
                  child: CircleAvatar(
                    radius: 48,
                    backgroundImage:
                        MemoryImage(globals.userLoggedIn.getUriFromAvatar()),
                  ),
                ),
                Text(globals.userLoggedIn.username,
                    style: const TextStyle(
                        color: Colors.black,
                        fontWeight: FontWeight.bold,
                        fontSize: 17,
                        decoration: TextDecoration.none))
              ],
            ),
          ),
          Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ElevatedButton(
                  onPressed: () {
                    infoClientService.gameMode = CLASSIC_MODE;
                    _toGameListPage();
                  },
                  child: const Text("Mode Classique"),
                ),
                ElevatedButton(
                  onPressed: () {
                    infoClientService.gameMode = POWER_CARDS_MODE;
                    _toGameListPage();
                  },
                  child: const Text("Mode Carte De Pouvoir Configurable"),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _toSearchPage() {
    Navigator.push(context,
            MaterialPageRoute(builder: (context) => const SearchPage()))
        .then((value) {
      setState(() {});
    });
  }

  void _toProfilePage() {
    Navigator.push(context,
            MaterialPageRoute(builder: (context) => ProfilePage(favouriteGames: games)))
        .then((value) {
      setState(() {});
    });
  }

  void _toGameListPage() {
    tapService.initDefaultVariables();
    Navigator.pushNamed(context, "/game-list");
  }

  void _logout() {
    controller.logout(globals.userLoggedIn);
    Navigator.pop(context);
  }
}
