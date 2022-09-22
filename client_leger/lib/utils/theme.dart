import 'package:flutter/material.dart';

import '../utils.dart';

final appTheme = ThemeData(
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
        borderSide: BorderSide(
            width: 2, color: createMaterialColor(const Color(0xFF0c483f))),
      ),
    )
);

