import 'dart:core';
import 'dart:math';

import 'package:client_leger/utils/utils.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/board.dart';

class BoardPainter extends CustomPainter {
  Board board;
  final int tilePadding = 2;
  late double tileSize;
  final int textTileColor = 0xFF104D45;
  final int textSideColor = 0xFF54534A;

  BoardPainter(this.board);

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
    tileSize = size.width / 17;
    for(var i=0; i<board.tiles.length; i++){
      for(var j=0; j<board.tiles.length; j++){
        if(i == 8 && j == 8){
          paint.color = createMaterialColor(Color(colorTilesMap["wordx2"]!));
          canvas.drawRect(
            Rect.fromLTWH(j * tileSize + tilePadding, i * tileSize + tilePadding, tileSize - tilePadding * 2, tileSize - tilePadding * 2),
            paint,
          );
          drawStar(canvas, Offset(j * tileSize, i * tileSize));
        }
        else if(i != 0 && i != 16 && j != 0 && j != 16){
          paint.color = createMaterialColor(Color(colorTilesMap[board.tiles[i][j]]!));
          canvas.drawRect(
            Rect.fromLTWH(j * tileSize + tilePadding, i * tileSize + tilePadding, tileSize - tilePadding * 2, tileSize - tilePadding * 2),
            paint,
          );
          drawTileText(canvas, textTilesMap[board.tiles[i][j]]!, Offset(j * tileSize + tilePadding, i * tileSize + tilePadding));
        }
        else{
          if(i == 0 && j != 0 && j != 16){
            drawSideText(canvas, j.toString(), Offset(j * tileSize + tilePadding, i * tileSize + tilePadding));
          }
          if(j == 0 && i != 0 && i != 16){
            drawSideText(canvas, indexToLetter[i]!, Offset(j * tileSize + tilePadding, i * tileSize + tilePadding));
          }
        }
      }
    }
  }

  void drawTileText(Canvas canvas, String tileType, Offset tilePos){
    final textStyle = TextStyle(
      color: createMaterialColor(Color(textTileColor)),
      fontSize: 9,
      fontWeight: FontWeight.bold,
    );
    final textSpan = TextSpan(
      text: tileType,
      style: textStyle,
    );
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    textPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - textPainter.width - 4) * 0.5),
    tilePos.dy + ((tileSize - textPainter.height) * 0.5)));
  }

  void drawSideText(Canvas canvas, String text, Offset tilePos){
    final textStyle = TextStyle(
      color: createMaterialColor(Color(textSideColor)),
      fontSize: 20,
      fontWeight: FontWeight.bold,
    );
    final textSpan = TextSpan(
      text: text,
      style: textStyle,
    );
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      text: textSpan,
      textDirection: TextDirection.ltr,
    );
    textPainter.layout(
      minWidth: 0,
      maxWidth: tileSize - tilePadding * 2,
    );
    textPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - textPainter.width - 4) * 0.5),
        tilePos.dy + ((tileSize - textPainter.height) * 0.5)));
  }

  void drawStar(Canvas canvas, Offset tilePos){
    final double longDistance = (tileSize / 2) - 1;
    final double smallDistance = longDistance / 2;
    const int numberOfPeak = 6;
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(const Color(0xFFAAA38E));
    final center = Offset(tilePos.dx + tileSize/2, tilePos.dy + tileSize/2);
    final Path star = Path();
    double angle = (2 * pi)/(numberOfPeak*2);
    star.moveTo(center.dx + longDistance, center.dy);
    for(int i = 1; i < (numberOfPeak * 2); i++){
      double distance = smallDistance;
      if(i % 2 == 0) {
        distance = longDistance;
      }
      star.lineTo(cos(angle*i) * distance + center.dx, sin(angle*i) * distance + center.dy);
    }
    star.close();
    canvas.drawPath(star, paint);
  }

  @override
  bool shouldRepaint(BoardPainter oldDelegate) => true;
}
