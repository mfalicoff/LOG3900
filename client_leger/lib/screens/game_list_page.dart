import 'dart:ui';

import 'package:client_leger/models/room-data.dart';
import 'package:client_leger/services/info_client_service.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import '../models/room.dart';

class GameListPage extends StatefulWidget {
  const GameListPage({Key? key}) : super(key: key);

  @override
  State<GameListPage> createState() => _GameListPageState();
}

class _GameListPageState extends State<GameListPage> {
  // late List<Room> rooms = [];
  final SocketService socketService = SocketService();
  final InfoClientService infoClientService = InfoClientService();

  @override
  void initState() {
    initSockets();
    super.initState();
    infoClientService.addListener(refresh);
  }

  void refresh() {
    if(mounted){
      setState(() {
      });
    }
  }

  void initSockets() {
    // TODO NEEDS TO UPDATE INFO CLIENT SERVICE[ROOMS]
    // socketService.socket.on('addElementListRoom', (data) {
    //   if (mounted) {
    //     setState(() {
    //       // Room room = Room.fromJson(data);
    //       RoomData room = RoomData.fromJson(data);
    //       var exist = gameService.rooms.where((element) => element.name == room.name);
    //       if(exist.isEmpty){
    //         // rooms.add(Room.fromJson(data));
    //         gameService.rooms.add(room);
    //       }
    //     });
    //   }
    // });
    // socketService.socket.on('removeElementListRoom', (data) {
    //   if (mounted) {
    //     setState(() {
    //       gameService.rooms.removeWhere((element) => element.name == data);
    //     });
    //   }
    // });
    socketService.socket.on("roomChangeAccepted", (data) {
      if(mounted){
        Navigator.pushNamed(context, "/game");
      }
    });
    socketService.socket.emit("listRoom");
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
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
                            onPressed: _goBackHomePage,
                            icon: Icon(
                              Icons.arrow_back,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(
                            width: 200.0,
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
                          const SizedBox(width: 300),
                          ElevatedButton(
                            onPressed: _createGame,
                            child: Text(
                              "Créer Partie",
                              style: TextStyle(
                                  color:
                                      Theme.of(context).colorScheme.secondary),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(
                        height: 30.0,
                      ),
                      Text(
                        "Liste des salles de jeux",
                        style: TextStyle(
                            fontSize: 25,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      const SizedBox(
                        height: 25.0,
                      ),
                      Expanded(
                        child: Container(
                          // decoration: BoxDecoration(
                          //   border: Border.all(
                          //       color: Theme.of(context).colorScheme.primary,
                          //       width: 2.0),
                          //   borderRadius: BorderRadius.circular(10),
                          // ),
                          child: gameList(
                            rooms: infoClientService.rooms.where((room) => room.gameMode == infoClientService.gameMode).toList(),
                          ),
                        ),
                      )
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

  void _createGame() {
    Navigator.pushNamed(context, "/create-game");
  }

  void _goBackHomePage() {
    Navigator.pop(context);
  }
}

class gameList extends StatefulWidget {
  gameList({Key? key, required this.rooms}) : super(key: key);

  late List<RoomData> rooms;

  @override
  State<gameList> createState() => _gameListState();
}

class _gameListState extends State<gameList> {

  SocketService socketService = SocketService();

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: DataTable(
        headingRowColor: MaterialStateColor.resolveWith(
            (states) => Theme.of(context).colorScheme.primary),
        border: TableBorder(
          horizontalInside: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          bottom: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          top: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          left: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          right: BorderSide(
              color: Theme.of(context).colorScheme.primary, width: 2.0),
          borderRadius: BorderRadius.circular(40),
        ),
        showCheckboxColumn: false,
        columns: [
          DataColumn(
            label: Expanded(
              child: Container(
                padding: EdgeInsets.zero,
                child: Text(
                  "Nom de la salle",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                  // textAlign: TextAlign.center,
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "Nom du créateur",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "Nombre de joueurs réel",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "Nombre de joueurs virtuels",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
          DataColumn(
            label: Expanded(
              child: Container(
                child: Text(
                  "Nombre d'observateurs",
                  overflow: TextOverflow.visible,
                  style:
                      TextStyle(color: Theme.of(context).colorScheme.secondary),
                ),
              ),
            ),
          ),
        ],
        rows: List<DataRow>.generate(
            widget.rooms.length,
            (int index) => DataRow(
                onSelectChanged: (bool? selected) {
                  if (selected!) {
                    socketService.socket.emit("joinRoom", {
                      'roomName': widget.rooms[index].name,
                      'playerId': socketService.socket.id,
                    });
                  }
                },
                cells: [
                  DataCell(Text(
                    widget.rooms[index].name,
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  )),
                  DataCell(Text(
                    widget.rooms[index].roomCreator,
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  )),
                  DataCell(Text(
                    widget.rooms[index].numberRealPlayer.toString(),
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  )),
                  DataCell(Text(
                    widget.rooms[index].numberVirtualPlayer.toString(),
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  )),
                  DataCell(Text(
                    widget.rooms[index].numberSpectators.toString(),
                    style:
                        TextStyle(color: Theme.of(context).colorScheme.primary),
                  )),
                ])),
      ),
    );
  }
}
