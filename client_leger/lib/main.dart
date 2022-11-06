import 'package:client_leger/screens/chat_page.dart';
import 'package:client_leger/screens/create_game_page.dart';
import 'package:client_leger/screens/game_list_page.dart';
import 'package:client_leger/screens/game_page.dart';
import 'package:client_leger/screens/home_page.dart';
import 'package:client_leger/screens/login_page.dart';
import 'package:client_leger/screens/ranked-init_page.dart';
import 'package:client_leger/screens/ranked_matchmaking_page.dart';
import 'package:client_leger/screens/signup_page.dart';
import 'package:client_leger/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'env/environment.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  const String environment = String.fromEnvironment(
    'ENVIRONMENT',
    defaultValue: Environment.DEVEMU,
  );

  Environment().initConfig(environment);
  print(Environment().config?.serverURL);
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.landscapeRight,
    DeviceOrientation.landscapeLeft,
  ]);
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: appTheme,
      routes: <String, WidgetBuilder>{
        '/chat': (BuildContext context) => const ChatPage(),
        '/home': (BuildContext context) => const MyHomePage(),
        '/login': (BuildContext context) => const LoginPage(),
        '/signup': (BuildContext context) => const SignUpPage(),
        '/create-game': (BuildContext context) => const CreateGamePage(),
        '/game': (BuildContext context) => const GamePage(),
        '/game-list': (BuildContext context) => const GameListPage(),
        '/ranked-init': (BuildContext context) => const RankedInitPage(),
        '/ranked-matchmaking': (BuildContext context) => const RankedMatchmakingPage(),
      },
      home: const LoginPage(),
    );
  }
}
