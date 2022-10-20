import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:client_leger/utils/globals.dart' as globals;

class CreateGamePage extends StatefulWidget {
  const CreateGamePage({Key? key}) : super(key: key);

  @override
  State<CreateGamePage> createState() => _CreateGamePageState();
}

class _CreateGamePageState extends State<CreateGamePage> {
  late String? nameRoom = "";
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
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
                            onPressed: _goBackGameListPage,
                            icon: Icon(
                              Icons.arrow_back,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          const SizedBox(
                            width: 315,
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
                        ],
                      ),
                      const SizedBox(
                        height: 30.0,
                      ),
                      Form(
                        key: _formKey,
                        child: TextFormField(
                          onSaved: (String? value) {
                            nameRoom = value;
                          },
                          validator: _roomNameValidator,
                          decoration: InputDecoration(
                            border: const OutlineInputBorder(),
                            labelText: "Nom de la salle",
                            labelStyle: TextStyle(
                                color: Theme.of(context).colorScheme.primary),
                          ),
                          style: TextStyle(
                              color: Theme.of(context).colorScheme.primary),
                        ),
                      ),
                      const SizedBox(
                        height: 25.0,
                      ),
                      Expanded(
                        child: Container(),
                      ),
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

  String? _roomNameValidator(String? value) {
    final validCharacters = RegExp(r'^[a-zA-Z0-9]+$');
    if (value == null || value.isEmpty) {
      return "Rentrez un nom de salle";
    } else if (value.length < 4 ||
        value.length > 19 ||
        !validCharacters.hasMatch(value)) {
      return "Nom de salle non valide";
    } else {
      return null;
    }
  }

  void _goBackGameListPage() {
    Navigator.of(context).pop();
  }
}
