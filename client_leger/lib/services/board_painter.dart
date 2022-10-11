import 'dart:core';

import 'package:client_leger/utils/utils.dart';
import 'package:flutter/material.dart';

import '../constants/constants_test.dart';

class BoardPainter extends CustomPainter {
  final int boardPadding = 20;
  final List<List<String>> boardTiles = board;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(const Color(0xFFAAA38E));
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
  }

  void drawTiles(Canvas canvas) {
    for(var i=1; i<board.length; i++){
      for(var i=1; i<board.length; i++){

      }
    }
  }

  @override
  bool shouldRepaint(BoardPainter oldDelegate) => false;
}
