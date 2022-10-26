import 'dart:ui';

import 'package:client_leger/services/controller.dart';
import 'package:flutter/material.dart';
import '../models/user.dart';
import '../services/socket_service.dart';

class SearchPage extends StatefulWidget {
  const SearchPage({Key? key}) : super(key: key);

  @override
  State<SearchPage> createState() => _SearchPage();
}

class _SearchPage extends State<SearchPage> {
  final Controller controller = Controller();
  SocketService socketService = SocketService();
  late List<dynamic> usersFound = [];
  User? user;

  refresh() {
    if (!mounted) {
      return;
    }
    setState(() {});
  }

  _SearchPage() {
    socketService.socket.on("getPlayerNames", (data) {
      usersFound = data;
      refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/background.jpg"),
              fit: BoxFit.cover,
            ),
          ),
          padding:
              const EdgeInsets.symmetric(vertical: 50.0, horizontal: 100.0),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.symmetric(
                      vertical: 50.0, horizontal: 50.0),
                  child: SizedBox(
                    width: 300,
                    child: Container(
                      decoration: BoxDecoration(
                          shape: BoxShape.rectangle,
                          color: Theme.of(context).colorScheme.secondary,
                          borderRadius:
                              const BorderRadius.all(Radius.circular(20.0)),
                          border: Border.all(
                              color: Theme.of(context).colorScheme.primary,
                              width: 3)),
                      padding: const EdgeInsets.symmetric(
                          vertical: 25.0, horizontal: 5.0),
                      child: Center(
                        child: Column(
                          children: [
                            TextFormField(
                              onChanged: (String? value) {
                                socketService.socket
                                    .emit("getPlayerNames", (value));
                              },
                              decoration: InputDecoration(
                                border: const OutlineInputBorder(),
                                labelText: "Rechercher joueurs",
                                labelStyle: TextStyle(
                                    color:
                                        Theme.of(context).colorScheme.primary),
                              ),
                            ),
                            Expanded(
                              child: ListView.builder(
                                  shrinkWrap: true,
                                  itemCount: usersFound.length,
                                  itemBuilder:
                                      (BuildContext context, int index) {
                                    return GestureDetector(
                                        onTap: () async {
                                          var userWanted =
                                              await controller.getUserByName(
                                                  usersFound[index]['_id']);
                                          FocusScope.of(context).unfocus();
                                          user = userWanted;
                                          refresh();
                                        },
                                        child: Center(
                                            child: Text(
                                                '${usersFound[index]['name']}',
                                                style: const TextStyle(
                                                    color: Colors.black,
                                                    fontSize: 25,
                                                    decoration:
                                                        TextDecoration.none))));
                                  }),
                            )
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                Container(
                  decoration: BoxDecoration(
                      shape: BoxShape.rectangle,
                      color: Theme.of(context).colorScheme.secondary,
                      borderRadius:
                          const BorderRadius.all(Radius.circular(20.0)),
                      border: Border.all(
                          color: Theme.of(context).colorScheme.primary,
                          width: 3)),
                  padding: const EdgeInsets.symmetric(
                      vertical: 25.0, horizontal: 25.0),
                  width: 600,
                  child: user == null
                      ? const SizedBox(
                          width: 200,
                          height: 600,
                        )
                      : SizedBox(
                          width: 200,
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: 48,
                                backgroundImage:
                                    MemoryImage(user!.getUriFromAvatar()),
                              ),
                              Text(user!.username,
                                  style: const TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 17,
                                      decoration: TextDecoration.none)),
                              Container(
                                padding:
                                    const EdgeInsets.only(top: 50, bottom: 50),
                                child: Table(
                                  children: [
                                    TableRow(
                                      children: [
                                        returnRowTextElement('Parties jouees'),
                                        returnRowTextElement('Parties gagnes'),
                                        returnRowTextElement(
                                            'Score moyen par partie'),
                                        returnRowTextElement(
                                            'Temps moyen par partie'),
                                      ],
                                    ),
                                    TableRow(
                                      children: [
                                        returnRowTextElement(
                                            user!.gamesPlayed.toString()),
                                        returnRowTextElement(
                                            user!.gamesWon.toString()),
                                        returnRowTextElement(user!
                                            .averagePointsPerGame
                                            .toString()),
                                        returnRowTextElement(Duration(
                                                milliseconds: user!
                                                    .averageTimePerGame!
                                                    .round())
                                            .toString()),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.center,
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  returnHistoryScrollView(
                                      'Historique des Parties',
                                      user!.gameHistory!),
                                ],
                              )
                            ],
                          ),
                        ),
                ),
              ],
            ),
          )),
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
                height: 100,
                width: 200,
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
}
