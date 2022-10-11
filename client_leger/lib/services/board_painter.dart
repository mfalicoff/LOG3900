import 'dart:core';

import 'package:client_leger/utils/utils.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../constants/constants_test.dart';

class BoardPainter extends CustomPainter {
  final List<List<String>> boardTiles;
  final int tilePadding = 2;

  BoardPainter(this.boardTiles);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(const Color(0xFFAAA38E));
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    drawTiles(canvas, size);
  }

  void drawTiles(Canvas canvas, Size size) {
    final paint = Paint()
      ..style = PaintingStyle.fill;
    final tileSize = size.width / 17;
    for(var i=0; i<board.length; i++){
      for(var j=0; j<board.length; j++){
        if(i != 0 && i != 16 && j != 0 && j != 16){
          paint.color = createMaterialColor(Color(colorTilesMap[board[j][i]]!));
          canvas.drawRect(
            Rect.fromLTWH(i * tileSize + tilePadding, j * tileSize + tilePadding, tileSize - tilePadding * 2, tileSize - tilePadding * 2),
            paint,
          );
        }
      }
    }
  }

  @override
  bool shouldRepaint(BoardPainter oldDelegate) => true;
}
