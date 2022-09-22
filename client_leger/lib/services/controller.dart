import 'package:http/http.dart' as http;
import 'dart:convert';

import 'package:client_leger/models/user.dart';

class Controller {
  final String serverAddress = "http://192.168.109.1:3000/login";

  Future<User> login({email = String, password = String}) async {
    final response = await http.post(
      Uri.parse(serverAddress),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": email,
        "password": password,
      }),
    );
    if (response.statusCode == 200) {
      return User.fromJson(json.decode(response.body));
    } else {
      throw Exception('Failed to login');
    }
  }
}
