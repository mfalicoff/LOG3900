import 'dart:developer';

import 'package:client_leger/env/environment.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:client_leger/models/user.dart';

class Controller {
  final String? serverAddress = Environment().config?.serverURL;

  Future<User> login({email = String, password = String}) async {
    print("sending $email $password $serverAddress");
    final response = await http.post(
      Uri.parse("$serverAddress/login"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": email,
        "password": password,
      }),
    );
    inspect(response);
    if (response.statusCode == 200) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to login');
    }
  }

  Future<User> signUp({username = String, email = String, password = String}) async {
    final response = await http.post(
      Uri.parse("$serverAddress/users"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": email,
        "name": username,
        "password": password,
      }),
    );

    if (response.statusCode == 201) {
      //return User.fromJson(json.decode(response.body));
      return User("test", "test");
    } else {
      throw Exception('Failed to login');
    }
  }
}
