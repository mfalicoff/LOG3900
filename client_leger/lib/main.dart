import 'package:client_leger/login_page.dart';
import 'package:client_leger/utils.dart';
import 'package:flutter/material.dart';


void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        primarySwatch: createMaterialColor(const Color(0xFF0c483f)),
        colorScheme: ColorScheme.fromSwatch().copyWith(
            primary: createMaterialColor(const Color(0xFF0c483f)),
            secondary: createMaterialColor(const Color(0xFFf5deb3)),
        ),
        textTheme: TextTheme(
          headlineLarge: TextStyle(
            color: createMaterialColor(const Color(0xFF0c483f)),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(
              width: 2,
              color: createMaterialColor(const Color(0xFF0c483f)),

            )
          ),
          focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(width: 2, color: createMaterialColor(const Color(0xFF0c483f))),
          ),
        )
      ),
      //home: const MyHomePage(title: 'Flutter Demo Home Page'),
      home: const Scaffold(
        resizeToAvoidBottomInset: false,
        body: LoginPage(),
      ),
    );
  }
}


