import 'dart:ui';

import 'package:client_leger/services/users_controller.dart';
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:easy_localization/easy_localization.dart';
import 'package:flutter/material.dart';

import '../main.dart';
import '../services/info_client_service.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

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
                    borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary,
                        width: 3)),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 250.0),
                child: const Center(
                  child: LoginForm(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class LoginForm extends StatefulWidget {
  const LoginForm({Key? key}) : super(key: key);

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  String? email = "";
  String? password = "";
  Controller controller = Controller();
  final InfoClientService infoClientService = InfoClientService();
  final SocketService socketService = SocketService();

  @override
    Widget build(BuildContext context) {
    // const alarmAudioPath = "assets/audios/letter-placement.wav";
    // player.play(DeviceFileSource(alarmAudioPath));
    return Form(
      key: _formKey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
            tr("LOGIN.LOGIN"),
            style: Theme.of(context).textTheme.headlineLarge,
          ),
          TextFormField(
            onSaved: (String? value) {
              email = value;
            },
            validator: _emailValidator,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: tr("LOGIN.EMAIL"),
              labelStyle:
                  TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),
          ),
          TextFormField(
            onSaved: (String? value) {
              password = value;
            },
            validator: _passwordValidator,
            obscureText: true,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: 'LOGIN.PASSWORD'.tr(),
              labelStyle:
                  TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
            style: TextStyle(color: Theme.of(context).colorScheme.primary),
          ),
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
            onPressed: () async {
              bool response = await _submit();
              if (!response) {
                showAlertDialog(context);
              }
            },
            child: Text(
              tr("LOGIN.LOGIN"),
              style: TextStyle(
                  fontSize: 20, color: Theme.of(context).colorScheme.secondary),
            ),
          ),
          GestureDetector(
            onTap: _toSignUpPage,
            child: Text(
              tr("LOGIN.GO_SIGN_UP_PAGE"),
              style: TextStyle(color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }

  String? _emailValidator(String? value) {
    if (value == null || value.isEmpty) {
      return tr("LOGIN.ENTER_EMAIL");
    } else if (!RegExp(
            r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
        .hasMatch(value)) {
      return tr("LOGIN.ENTER_VALID_EMAIL");
    } else {
      return null;
    }
  }

  String? _passwordValidator(String? value) {
    if (value == null || value.isEmpty) {
      return tr("LOGIN.ENTER_PASSWORD");
    } else {
      return null;
    }
  }

  showAlertDialog(BuildContext context) {
    // set up the buttons
    Widget cancelButton = TextButton(
      child: Text(tr("CANCEL")),
      onPressed: () {
        Navigator.of(context).pop();
      },
    );
    Widget continueButton = TextButton(
      child: Text(tr("CONTINUE")),
      onPressed: () async {
        try {
          globals.userLoggedIn = await controller.forceLogin(
              email: email, password: password, socket: socketService.socket);
          infoClientService.playerName = globals.userLoggedIn.username;
          socketService.socket.emit('forceLogout', globals.userLoggedIn.username);
          Navigator.pushNamed(context, "/home");
        } on Exception {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(tr("LOGIN.UNABLE_TO_CONNECT")),
            backgroundColor: Colors.red.shade300,
          ));
        }
      },
    );

    // set up the AlertDialog
    AlertDialog alert = AlertDialog(
      title: Text(
          tr("LOGIN.CONNECTED_OTHER_DEVICE")),
      content: Text(
          tr("LOGIN.YOU_WILL_GIVE_UP")),
      actions: [
        cancelButton,
        continueButton,
      ],
    );

    // show the dialog
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return alert;
      },
    );
  }

  Future<bool> _submit() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState?.save();
      try {
        globals.userLoggedIn = await controller.login(
            email: email, password: password, socket: socketService.socket);
        infoClientService.playerName = globals.userLoggedIn.username;
        if (mounted){
          context.setLocale(Locale(globals.userLoggedIn.language!));
          MyApp.of(context)!.changeTheme(globals.userLoggedIn.theme as String);
          Navigator.pushNamed(context, "/home");
        }
        return true;
      } on Exception catch (e) {
        print(e.toString());
        if (e.toString().contains("Already Logged In")) {
          return false;
        } else {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text(tr("LOGIN.UNABLE_TO_CONNECT")),
            backgroundColor: Colors.red.shade300,
          ));
          return true;
        }
      }
    }
    return true;
  }

  void _toSignUpPage() {
    Navigator.pushNamed(context, "/signup");
  }
}
