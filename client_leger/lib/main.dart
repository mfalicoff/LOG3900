import 'package:client_leger/screens/chat_page.dart';
import 'package:client_leger/screens/login_page.dart';
import 'package:client_leger/utils/theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'env/environment.dart';


void main() {

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
      routes: <String, WidgetBuilder> {
        '/chat' : (BuildContext context) => new ChatPage(),
      },      home: const Scaffold(
        resizeToAvoidBottomInset: false,
        body: LoginPage(),
      ),
    );
  }
}


