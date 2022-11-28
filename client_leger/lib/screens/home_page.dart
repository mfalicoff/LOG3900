import 'package:client_leger/screens/profile-page.dart';
import 'package:client_leger/screens/search_page.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:easy_localization/easy_localization.dart';
import '../constants/constants.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

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
  final String? serverAddress = Environment().config?.serverURL;
  ChatService chatService = ChatService();

  @override
  void initState() {
    super.initState();
    controller.getFavouriteGames();
  }

  refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  Widget build(BuildContext context) {
    socketService.socket.emit('getAllChatRooms');
    return WillPopScope(
        onWillPop: () async {
      _logout();
      return false;
    },
    child: Scaffold(
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
                  child: Icon(
                    Icons.search,
                    color: Theme.of(context).colorScheme.secondary,
                  ))),
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
              child: Icon(
                Icons.logout,
                color: Theme.of(context).colorScheme.secondary,
              ),
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
                  onPressed: () {
                    infoClientService.gameMode = CLASSIC_MODE;
                    _toGameListPage();
                  },
                  child: Text("HOME_SCREEN.CLASSIC_MODE".tr(), style: TextStyle(color: Theme.of(context).colorScheme.secondary),),
                ),
                ElevatedButton(
                  onPressed: () {
                    infoClientService.gameMode = POWER_CARDS_MODE;
                    _toGameListPage();
                  },
                  child: Text("HOME_SCREEN.POWER_CARDS_MODE".tr(), style: TextStyle(color: Theme.of(context).colorScheme.secondary),),
                ),
              ],
            ),
          ),
          StatefulBuilder(
            builder: (BuildContext context, StateSetter setState) {
              return Positioned(
                top: 190,
                right: 30,
                child: Container(
                  height: 63,
                  width: 63,
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.primary,
                    borderRadius: const BorderRadius.all(Radius.circular(35.0)),
                  ),
                  child: IconButton(
                    iconSize: 50,
                    icon: CircleAvatar(
                      radius: 20,
                      backgroundColor: Theme.of(context).colorScheme.primary,
                      backgroundImage:
                      infoClientService.soundDisabled ?
                      const AssetImage('assets/volume-off-white.png') :
                      const AssetImage('assets/volume-on-white.png'),
                    ),
                    onPressed: () {
                      setState(() =>{infoClientService.soundDisabled = !infoClientService.soundDisabled});
                      infoClientService.notifyListeners();
                      socketService.notifyListeners();
                    },
                  ),
                ),
              );
            }
          ),
        ],
      ),
    ),);
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
            MaterialPageRoute(builder: (context) => ProfilePage()))
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
