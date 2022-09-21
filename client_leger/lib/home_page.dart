import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key, required this.title});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  final String title;

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {

  @override
  Widget build(BuildContext context) {
    // This method is rerun every time setState is called, for instance as done
    // by the _incrementCounter method above.
    //
    // The Flutter framework has been optimized to make rerunning build methods
    // fast, so that you can just rebuild anything that needs updating rather
    // than having to individually change instances of widgets.
    return Scaffold(
        appBar: AppBar(
          // Here we take the value from the MyHomePage object that was created by
          // the App.build method, and use it to set our appbar title.
          title: Text(widget.title),
        ),
        body: Stack(
          children: <Widget>[
            Container(
              decoration: const BoxDecoration(
                image: DecorationImage(image: AssetImage("assets/background.jpg"), fit: BoxFit.cover,),
              ),
            ),
            Positioned(
                top: 10.0,
                right: 30.0,
                child: ElevatedButton(
                    style: ButtonStyle(
                        padding: MaterialStateProperty.all(
                          const EdgeInsets.symmetric(vertical: 18.0, horizontal: 0.0),
                        ),
                        shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                            RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(100.0)
                            )
                        )
                    ),
                    onPressed: _toChatPage,
                    child: const Icon(Icons.chat))
            ),
            Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    ElevatedButton(onPressed: _toGameListPage, child: const Text("Mode Classique")),
                    ElevatedButton(onPressed: _testHTTP, child: const Text("Test HTTP get users")),
                    ElevatedButton(onPressed: _testHTTPCreate, child: const Text("Test HTTP create user")),
                    ElevatedButton(onPressed: _testHTTPLogin, child: const Text("Test HTTP login user")),
                  ],
                )
            )
          ],
        )
    );
  }

  void _toChatPage() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) => const Text("Chat page")
        )
    );
  }

  void _testHTTP() async {
    print("test get");
    final response = await http
        .get(Uri.parse('http://192.168.2.43:3000/users'));
    print("test get, ${response.body}");
    if (response.statusCode == 200) {
      // If the server did return a 200 OK response,
      // then parse the JSON.

    } else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load album');
    }
  }

  void _testHTTPCreate() async {
    print("test post");

    final response = await http.post(
      Uri.parse('http://192.168.2.43:3000/users'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": "example@email.com",
        "name": "username",
        "password": "password"
      }),
    );
    print("test post, ${response.body}");
    if (response.statusCode == 200) {
      // If the server did return a 200 OK response,
      // then parse the JSON.

    } else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load album');
    }
  }

  void _testHTTPLogin() async {
    print("test post");

    final response = await http.post(
      Uri.parse('http://192.168.2.43:3000/login'),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": "example@email.com",
        "password": "password"
      }),
    );
    print("test post, ${response.body}");
    if (response.statusCode == 200) {
      // If the server did return a 200 OK response,
      // then parse the JSON.

    } else {
      // If the server did not return a 200 OK response,
      // then throw an exception.
      throw Exception('Failed to load album');
    }
  }

  void _toGameListPage() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) => const Text("Game list page")
        )
    );
  }
}