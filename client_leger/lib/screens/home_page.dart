import 'package:client_leger/screens/profile-page.dart';
import 'package:client_leger/screens/search_page.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../services/chat-service.dart';
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
  ChatService chatService = ChatService();

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
                  onPressed: (){
                    infoClientService.gameMode = CLASSIC_MODE;
                    _toGameListPage();
                  },
                  child: const Text("Mode Classique"),
                ),
                ElevatedButton(
                  onPressed: (){
                    infoClientService.gameMode = POWER_CARDS_MODE;
                    _toGameListPage();
                  },
                  child: const Text("Mode Carte De Pouvoir Configurable"),
                ),
                ElevatedButton(
                  onPressed: (){
                    infoClientService.gameMode = MODE_RANKED;
                    _toRankedInitPage();
                  },
                  child: const Text("Mode De Jeu Classé"),
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
            MaterialPageRoute(builder: (context) => const ProfilePage()))
        .then((value) {
      setState(() {});
    });
  }

  void _toGameListPage() {
    print("GameModeIs: " + infoClientService.gameMode);
    Navigator.pushNamed(context, "/game-list"); // best way to change page
  } // context is the information of the widget

  void _toRankedInitPage() {
    print("GameModeIs: " + infoClientService.gameMode);
    Navigator.pushNamed(context, "/ranked-init"); // best way to change page
  } // context is the information of the widget

  void _logout() {
    controller.logout(globals.userLoggedIn);
    Navigator.pop(context);
  }
}
