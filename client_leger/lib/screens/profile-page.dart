import 'dart:ui';

import 'package:client_leger/services/controller.dart';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;


class ProfilePage extends StatefulWidget {
  const ProfilePage({Key? key}) : super(key: key);

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<ProfilePage> createState() => _ProfileStatePage();
}

class _ProfileStatePage extends State<ProfilePage> {
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
          padding:
          const EdgeInsets.symmetric(vertical: 100.0, horizontal: 200.0),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
            child: Container(
              decoration: BoxDecoration(
                  shape: BoxShape.rectangle,
                  color: Theme
                      .of(context)
                      .colorScheme
                      .secondary,
                  borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                  border: Border.all(
                      color: Theme
                          .of(context)
                          .colorScheme
                          .primary, width: 3)),
              padding:
              const EdgeInsets.symmetric(vertical: 25.0, horizontal: 250.0),
              child: Center(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      CircleAvatar(
                      radius: 48,
                      backgroundImage: MemoryImage(globals.userLoggedIn.getUriFromAvatar()),
                      ),
                      Text(
                          globals.userLoggedIn.username,
                          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 17, decoration: TextDecoration.none)
                      ),
                      Row(
                        children: [
                          Expanded(
                            child:
                                ListView.builder(
                                  scrollDirection: Axis.vertical,
                                  shrinkWrap: true,
                                  itemCount: globals.userLoggedIn.actionHistory?.length,
                                  itemBuilder: (BuildContext context, int index) {
                                    return Container(
                                        width: 100,
                                        child: SingleChildScrollView(
                                            child: Text(globals.userLoggedIn.actionHistory![index])
                                        )
                                    );
                                  }
                                )
                          ),
                          Expanded(
                              child:
                              ListView.builder(
                                  scrollDirection: Axis.vertical,
                                  shrinkWrap: true,
                                  itemCount: globals.userLoggedIn.gameHistory?.length,
                                  itemBuilder: (BuildContext context, int index) {
                                    return Container(
                                        width: 100,
                                        child: SingleChildScrollView(
                                            child: Text(globals.userLoggedIn.gameHistory![index])
                                        )
                                    );
                                  }
                              )
                          ),
                        ],
                      )

                    ],
                  ),

                ),
              ),
            )
          ),
        ],
      );
  }
}
