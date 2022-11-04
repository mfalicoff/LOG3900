import 'dart:convert';
import 'dart:ui';
import 'package:http/http.dart' as http;
import 'package:client_leger/services/controller.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

import '../env/environment.dart';
import '../utils/utils.dart';

class SignUpPage extends StatelessWidget {
  const SignUpPage({Key? key}) : super(key: key);

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
                      borderRadius:
                          const BorderRadius.all(Radius.circular(20.0)),
                      border: Border.all(
                          color: Theme.of(context).colorScheme.primary,
                          width: 3)),
                  padding: const EdgeInsets.symmetric(
                      vertical: 25.0, horizontal: 250.0),
                  child: Column(
                    children: const [
                      // Center(
                      //   child: AvatarPicker(),
                      // ),
                      Center(
                        child: SignUpForm(),
                      ),
                    ],
                  )),
            ),
          )
        ],
      ),
    );
  }
}

class SignUpForm extends StatefulWidget {
  const SignUpForm({Key? key}) : super(key: key);

  @override
  State<SignUpForm> createState() => _SignUpFormState();
}

class _SignUpFormState extends State<SignUpForm> {
  final _formKey = GlobalKey<FormState>();
  String? email = "";
  String? username = "";
  String? password = "";
  String? avatarPath = "";
  Controller controller = Controller();
  late List<dynamic> avatars;
  final String? serverAddress = Environment().config?.serverURL;

  @override
  initState() {
    super.initState();
    http
        .get(
      Uri.parse("$serverAddress/avatar"),
    )
        .then((res) => parseAvatars(res));
  }

  parseAvatars(http.Response res) {
    var parsed = jsonDecode(res.body);
    avatars = parsed["data"] ?? "Failed";
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [ TextButton(
          onPressed: () => showDialog<String>(
              context: context,
              builder: (BuildContext context) {
                return StatefulBuilder(builder: (context, setState) {
                  return AlertDialog(
                    title: const Text('Avatar'),
                    content:
                    const Text('Selectionner avatar voulu, une photo se seras que disponible dans la page de modification du compte'),
                    backgroundColor: Theme.of(context).colorScheme.secondary,
                    actions: <Widget>[
                      Container(
                          child: Column(
                            children: [
                              Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    avatarPicker(0),
                                    avatarPicker(2),
                                    avatarPicker(4),
                                    avatarPicker(6),
                                  ]),
                              Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    avatarPicker(1),
                                    avatarPicker(3),
                                    avatarPicker(5),
                                    avatarPicker(7),
                                  ]),
                            ],
                          )),
                    ],
                  );
                });
              }),
          child: const Text('Selectionner avatar'),
        ),
          Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Text(
                "Sign Up",
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              const SizedBox(height: 30),
              TextFormField(
                onSaved: (String? value) {
                  username = value;
                },
                validator: _usernameValidator,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: "Pseudonyme",
                  labelStyle:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
              const SizedBox(height: 30),
              TextFormField(
                onSaved: (String? value) {
                  email = value;
                },
                validator: _emailValidator,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: "Adresse Courriel",
                  labelStyle:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
              const SizedBox(height: 30),
              TextFormField(
                onSaved: (String? value) {
                  password = value;
                },
                validator: _passwordValidator,
                obscureText: true,
                decoration: InputDecoration(
                  border: const OutlineInputBorder(),
                  labelText: "Mot de passe",
                  labelStyle:
                      TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
                style: TextStyle(color: Theme.of(context).colorScheme.primary),
              ),
              const SizedBox(height: 30),
              ElevatedButton(
                style: ButtonStyle(
                  padding: MaterialStateProperty.all(
                    const EdgeInsets.symmetric(vertical: 18.0, horizontal: 40.0),
                  ),
                  shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                    RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10.0),
                    ),
                  ),
                ),
                onPressed: _submit,
                child: Text(
                  "Submit",
                  style: TextStyle(
                      fontSize: 20,
                      color: Theme.of(context).colorScheme.secondary),
                ),
              ),
              const SizedBox(height: 30),
              GestureDetector(
                onTap: _toLoginPage,
                child: Text(
                  "Go to the Login Page",
                  style: TextStyle(color: Theme.of(context).colorScheme.primary),
                ),
              ),
            ],
          ),
      ]),
    );
  }

  GestureDetector avatarPicker(int index) {
    return (GestureDetector(
        onTap: () {
          avatarPath = 'avatar${index+1}';
          Navigator.pop(context);
        },
        child: getAvatarFromString(48, avatars[index]['uri'])));
  }

  String? _emailValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez une adresse courriel";
    } else if (!RegExp(
            r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
        .hasMatch(value)) {
      return "Rentrez une adresse courriel valide";
    } else {
      return null;
    }
  }

  String? _usernameValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez un pseudonyme";
    } else if (!RegExp(r'^[a-zA-Z0-9]+$').hasMatch(value)) {
      return "Rentrez un pseudonyme avec des charactères alphanumériques";
    } else {
      return null;
    }
  }

  String? _passwordValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez un mot de passe";
    } else {
      return null;
    }
  }

  Future<void> _submit() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      try {
        if(avatarPath == '') {
          avatarPath = 'avatar1';
        }
        await controller.signUp(
            username: username, email: email, password: password, avatarPath: avatarPath);
        Navigator.pop(context);
      } on Exception {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text("Impossible de créer un compte"),
          backgroundColor: Colors.red.shade300,
        ));
      }
    }
  }

  void _toLoginPage() {
    Navigator.of(context).pop();
  }
}
