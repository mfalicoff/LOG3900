import 'dart:io';

import 'package:client_leger/env/environment.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:client_leger/models/user.dart';

class Controller {
  final String? serverAddress = Environment().config?.serverURL;

  Future<User> login({email = String, password = String, socket = Socket}) async {
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
    if (response.statusCode == 200) {
      User user = User.fromJson(json.decode(response.body));
      user.cookie = json.decode(response.body)["token"];
      socket.emit("new-user", user.username);
      return user;
    } else {
      if(response.statusCode == 409) {
        throw Exception('Already Logged In');
      } else {
        throw Exception('Failed to login');
      }
    }
  }

  Future<User> forceLogin({email = String, password = String, socket = Socket}) async {
    final response = await http.post(
      Uri.parse("$serverAddress/forceLogin"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": email,
        "password": password,
      }),
    );
    if (response.statusCode == 200) {
      User user = User.fromJson(json.decode(response.body));
      user.cookie = json.decode(response.body)["token"];
      socket.emit("new-user", user.username);
      return user;
    } else {
      if(response.statusCode == 409) {
        throw Exception('Already Logged In');
      } else {
        throw Exception('Failed to login');
      }
    }
  }

  Future<User> signUp(
      {username = String, email = String, password = String, avatarPath = String}) async {
    final response = await http.post(
      Uri.parse("$serverAddress/users"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "email": email,
        "name": username,
        "password": password,
        "avatarPath": avatarPath
      }),
    );

    if (response.statusCode == 201) {
      //return User.fromJson(json.decode(response.body));
      return User("test", "test");
    } else {
      throw Exception('Failed to login');
    }
  }

  Future<User> logout(User user) async {
    final response = await http.post(
      Uri.parse("$serverAddress/logout"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': user.cookie?.split("=")[1].split(";")[0] as String,
      },
      body: jsonEncode(<String, String>{}),
    );

    if (response.statusCode == 200) {
      return user.clear();
    } else {
      throw Exception('Failed to logout');
    }
  }

  Future<User> updateName(String newName) async {
    final user = globals.userLoggedIn;
    final response = await http.put(
      Uri.parse("$serverAddress/users/${user.id}"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': user.cookie?.split("=")[1].split(";")[0] as String,
      },
      body: jsonEncode(<String, String>{"name": newName}),
    );

    if (response.statusCode == 200) {
      User user = User.fromJson(json.decode(response.body));
      return user;
    } else {
      throw Exception('Failed to update name');
    }
  }

  updateAvatarFromCamera(File image) async {
    final bytes = await image.readAsBytes();
    final response = await http.post(
      Uri.parse("$serverAddress/avatar/send"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: jsonEncode(<String, String>{
        "avatarUri": base64Encode(bytes),
        "id": globals.userLoggedIn.id as String
      }),
    );

    if (response.statusCode == 200) {
      return await updateAvatar('customAvatar');
    } else {
      throw Exception('Failed to update avater from camera');
    }
  }

  updateAvatar(String avatarPath) async {
    final user = globals.userLoggedIn;
    final response = await http.put(
      Uri.parse("$serverAddress/users/${user.id}"),
      headers: <String, String>{
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': user.cookie?.split("=")[1].split(";")[0] as String,
      },
      body: jsonEncode(<String, String>{"avatarPath": avatarPath}),
    );
    if (response.statusCode == 200) {
      User user = User.fromJson(json.decode(response.body));
      return user;
    } else {
      throw Exception('Failed to update avatar');
    }
  }

  updateFavouriteGames(String idOfGame) async {
    final user = globals.userLoggedIn;
    final response = await http.patch(Uri.parse("$serverAddress/users/${user.id}"),
        headers : <String, String> {
            'Content-Type': 'application/json; charset=UTF-8',
            'Authorization': user.cookie?.split("=")[1].split(";")[0] as String,
        },
        body: jsonEncode(<String, String>{"gameId": idOfGame}),
    );
    if (response.statusCode == 200) {
        User user = User.fromJson(json.decode(response.body));
        return user;
    } else {
        throw Exception('Failed update favourite games');
    }
  }

  Future<User> getUserByName(String id) async {
    final response = await http.get(Uri.parse("$serverAddress/users/id/$id"));
    if (response.statusCode == 200) {
      User user = User.fromJson(json.decode(response.body));
      return user;
    } else {
      throw Exception('Failed to get username');
    }
  }

  updateLanguage(String languageUpdated) async {
    final user = globals.userLoggedIn;
    final response = await http.put(Uri.parse("$serverAddress/users/language/${user.id}"),
      headers : <String, String> {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': user.cookie?.split("=")[1].split(";")[0] as String,
      },
      body: jsonEncode(<String, String>{"language": languageUpdated}),
    );
    if (response.statusCode != 200) {
      throw Exception("Failed to update language");
    }
  }

  Future<List<dynamic>> getFavouriteGames() async {
    final user = globals.userLoggedIn;
    final response = await http.get(Uri.parse("$serverAddress/users/games/${user.id}"));
    if (response.statusCode == 200) {
      List<dynamic> favouriteGames = json.decode(response.body);
      return favouriteGames;
    } else {
        throw Exception('Failed to get favourite games');
    }
  }
}
