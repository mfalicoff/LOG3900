import 'dart:ui';

import 'package:client_leger/home_page.dart';
import 'package:client_leger/services/controller.dart';
import 'package:flutter/material.dart';

import 'models/user.dart';

class LoginPage extends StatelessWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Stack(
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
              child: const Center(
                child: LoginForm(),
              ),
            ),
          ),
        )
      ],
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

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          Text(
            "Login",
            style: Theme
                .of(context)
                .textTheme
                .headlineLarge,
          ),
          TextFormField(
            onSaved: (String? value) {
              email = value;
            },
            validator: _emailValidator,
            decoration: InputDecoration(
              border: const OutlineInputBorder(),
              labelText: "Adresse Courriel",
              labelStyle:
              TextStyle(color: Theme
                  .of(context)
                  .colorScheme
                  .primary),
            ),
            style: TextStyle(color: Theme
                .of(context)
                .colorScheme
                .primary),
          ),
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
              TextStyle(color: Theme
                  .of(context)
                  .colorScheme
                  .primary),
            ),
            style: TextStyle(color: Theme
                .of(context)
                .colorScheme
                .primary),
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
            onPressed: _submit,
            child: Text(
              "Submit",
              style: TextStyle(
                  fontSize: 20, color: Theme
                  .of(context)
                  .colorScheme
                  .secondary),
            ),
          ),
          GestureDetector(
            onTap: _toSignUpPage,
            child: Text(
              "Go to the Sign Up Page",
              style: TextStyle(color: Theme
                  .of(context)
                  .colorScheme
                  .primary),
            ),
          ),
        ],
      ),
    );
  }

  String? _emailValidator(String? value) {
    if (value == null || value.isEmpty) {
      return "Rentrez une adresse courriel";
    } else if (!RegExp(
        r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+")
        .hasMatch(value)) {
      return "Rentrez une adresse courriel valide";
    }
    else {
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
      try{
        User user = await controller.login(email: email, password: password);
        print(user.username);
        print(user.email);
        Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const MyHomePage()));
      } on Exception{
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: const Text("Impossible de se connecter"),
          backgroundColor: Colors.red.shade300,
        ));
      }
    }
  }

  void _toSignUpPage() {
    Navigator.of(context).push(
        MaterialPageRoute(builder: (context) => const Text("Sign up page")));
  }
}
