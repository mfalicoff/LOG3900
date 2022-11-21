import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:client_leger/models/game-saved.dart';
import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/models/user.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:image_picker/image_picker.dart';
import 'package:client_leger/utils/utils.dart';
import '../services/chat-service.dart';
import '../widget/chat_panel.dart';

import '../env/environment.dart';

class ProfileReadOnlyPage extends StatefulWidget {
  final User data;

  const ProfileReadOnlyPage({
      Key? key,
      required this.data,
      }) : super(key: key);

  @override
  State<ProfileReadOnlyPage> createState() => _ProfileReadOnlyStatePage();
}

class _ProfileReadOnlyStatePage extends State<ProfileReadOnlyPage> {

@override
  Widget build(BuildContext context) {
    return Scaffold(
        body: Stack(
      children: <Widget>[
        Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 70.0, horizontal: 100.0),
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
                    vertical: 20.0, horizontal: 30.0),
                child: Center(
                  child: Column(
                    children: [
                        CircleAvatar(
                            radius: 48,
                            backgroundImage: MemoryImage(
                                globals.userLoggedIn.getUriFromAvatar()),
                        ),
                    ],
                  ),
                ),

              ),
            ),
            ),
        ],
        ),
    );

  }

    Text returnRowTextElement(String textData) {
    return Text((textData),
        style: const TextStyle(
            color: Colors.black,
            fontSize: 13,
            decoration: TextDecoration.none,
            fontWeight: FontWeight.bold));
  }

}
