import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

import '../env/environment.dart';
import '../models/room.dart';

class GameListPage extends StatefulWidget {
  const GameListPage({Key? key}) : super(key: key);

  @override
  State<GameListPage> createState() => _GameListPageState();
}

class _GameListPageState extends State<GameListPage> {
  late IO.Socket socket;
  late List<Room> rooms = [];

  @override
  void initState() {
    socket = IO.io(
        Environment().config?.serverURL,
        OptionBuilder().setTransports(['websocket']) // for Flutter or Dart VM
            .setExtraHeaders({'foo': 'bar'}) // optional
            .build());
    OptionBuilder().setTransports(['websocket']);
    initSockets();
    super.initState();
  }

  void initSockets() {
    socket.on('addElementListRoom', (data) {
      if (mounted) {
        setState(() {
          rooms.add(Room.fromJson(data));
          print(data);
        });
      }
    });
    socket.emit("listRoom");
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
                          Icon(
                            Icons.arrow_back,
                            color: Theme.of(context).colorScheme.primary,
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
                            rooms: rooms,
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

  void _createGame() {}
}

class gameList extends StatefulWidget {
  gameList({Key? key, required this.rooms}) : super(key: key);

  late List<Room> rooms;

  @override
  State<gameList> createState() => _gameListState();
}

class _gameListState extends State<gameList> {
  @override
  Widget build(BuildContext context) {
    return DataTable(
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
        borderRadius: BorderRadius.circular(40),
      ),
      columns: [
        DataColumn(
          label: Expanded(
            child: Container(
              child: Text(
                "Nom de la salle",
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
          (int index) => DataRow(cells: [
                DataCell(Text(
                  widget.rooms[index].roomName,
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
    );
  }
}
