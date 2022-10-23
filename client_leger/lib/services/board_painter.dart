import 'dart:core';
import 'dart:math';

import 'package:client_leger/utils/utils.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/board.dart';
import '../models/stand.dart';

class BoardPainter extends CustomPainter {
  Board board;
  Stand stand;
  double tilePadding = 2;
  late double tileSize;
  final int textTileColor = 0xFF104D45;
  final int textSideColor = 0xFF54534A;
  final int borderColor = 0xFFAAA38E;

  BoardPainter(this.board, this.stand);

  @override
  void paint(Canvas canvas, Size size) {
    tileSize = crossProduct(WIDTH_EACH_SQUARE, size.height);
    tilePadding = crossProduct(WIDTH_LINE_BLOCKS, size.height);
    drawStands(canvas, size);
    drawBoard(canvas, size);
  }

  //draw the board (border/text/tiles)
  void drawBoard(Canvas canvas, Size canvasSize){
    final paint = Paint()
      ..style = PaintingStyle.fill
      ..color = createMaterialColor(Color(borderColor));
    canvas.drawRect(
      Rect.fromLTWH(
          crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height),
          crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height),
          crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height), crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height)),
      paint,
    );
    drawBoardTiles(canvas, canvasSize);
    drawBoardBorderLetters(canvas, canvasSize);
  }

  //draws the tiles on the board
  void drawBoardTiles(Canvas canvas, Size canvasSize) {
    final paint = Paint()
      ..style = PaintingStyle.fill;
    double startXY =
      crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
      - (tileSize + tilePadding) //gets rid of the start at index 1 instead of putting (i-1) everywhere in the code
      + crossProduct(SIZE_OUTER_BORDER_BOARD, canvasSize.height); //adds border
    for(var i = 1; i < board.tiles.length - 1; i++){
      for(var j = 1; j < board.tiles.length - 1; j++){
        if(i == 8 && j == 8){
          paint.color = createMaterialColor(Color(colorTilesMap["wordx2"]!));
          canvas.drawRect(
            Rect.fromLTWH(
                startXY + j * (tileSize + tilePadding),
                startXY + i * (tileSize + tilePadding),
                tileSize,
                tileSize,
            ),
            paint,
          );
          drawStar(canvas, Offset(startXY + j * (tileSize + tilePadding), startXY + i * (tileSize+ tilePadding)));
        } else {
          paint.color = createMaterialColor(Color(colorTilesMap[board.tiles[i][j]]!));
          canvas.drawRect(
            Rect.fromLTWH(
                startXY + j * (tileSize + tilePadding),
                startXY + i * (tileSize + tilePadding),
                tileSize,
                tileSize,
            ),
            paint,
          );
          drawTileText(
              canvas,
              textTilesMap[board.tiles[i][j]]!,
              Offset(startXY + j * (tileSize + tilePadding), startXY + i * (tileSize + tilePadding)));
        }
      }
    }
  }

  void drawBoardBorderLetters(Canvas canvas, Size canvasSize){
    double startXY =
      crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height);
    const magicToCenterLetter = 4;
    for(var i = 1; i < board.tiles.length - 1; i++) {
      drawSideText(
        canvas, i.toString(),
        Offset(
            startXY + i * (tileSize + tilePadding) - magicToCenterLetter,
            startXY,
        ),
      );
      drawSideText(
        canvas, indexToLetter[i]!,
        Offset(
          startXY,
          startXY + i * (tileSize + tilePadding) - magicToCenterLetter,
        ),
      );
    }
  }

  void drawTileText(Canvas canvas, String tileType, Offset tilePos){
    final textStyle = TextStyle(
      color: createMaterialColor(Color(textTileColor)),
      fontSize: 7,
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
    textPainter.paint(canvas, Offset(tilePos.dx + ((tileSize - textPainter.width) * 0.5),
        tilePos.dy + (((tileSize+tilePadding) - textPainter.height) * 0.5)));
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

  void drawStands(Canvas canvas, Size canvasSize){
    double constPosXYForStands =
        crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
        + crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height) / 2
        - crossProduct(WIDTH_STAND, canvasSize.height) / 2;
    double paddingForRightAndBottomStands =
        crossProduct(PADDING_BOARD_FOR_STANDS, canvasSize.height)
        + crossProduct(WIDTH_HEIGHT_BOARD, canvasSize.height)
        + crossProduct(PADDING_BET_BOARD_AND_STAND, canvasSize.height);

    //top stand
    drawHorizStand(constPosXYForStands, 0, canvas, canvasSize);
    //left stand
    drawVertiStand(0, constPosXYForStands, canvas, canvasSize);
    //right stand
    drawVertiStand(
        paddingForRightAndBottomStands, constPosXYForStands,
        canvas, canvasSize);
    //bottom Stand
    drawHorizStand(
        constPosXYForStands, paddingForRightAndBottomStands,
        canvas, canvasSize);
  }

  void drawHorizStand(double startX, double startY, Canvas canvas, Size canvasSize){
    final paint = Paint()
    ..style = PaintingStyle.fill;

    // Fill the rectangle with an initial color
    // paint.color = Color(colorTilesMap["xx"]!);
    paint.color = Color(borderColor);
    canvas.drawRect(
        Rect.fromLTWH(
            startX, startY,
            crossProduct(WIDTH_STAND, canvasSize.height),
            crossProduct(HEIGHT_STAND, canvasSize.height),
        ),
        paint,
    );
    for(int i = 0; i < stand.tiles.length; i++){
      paint.color = createMaterialColor(Color(colorTilesMap[stand.tiles[i]]!));
      canvas.drawRect(
        Rect.fromLTWH(
            startX + i * (tileSize + tilePadding) + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height),
            startY + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height),
            tileSize,
            tileSize,
        ),
        paint,
      );
    }
  }

  void drawVertiStand(double startX, double startY, Canvas canvas, Size canvasSize){
    final paint = Paint()
      ..style = PaintingStyle.fill;

    // Fill the rectangle with an initial color
    // paint.color = Color(colorTilesMap["xx"]!);
    paint.color = Color(borderColor);
    canvas.drawRect(
      Rect.fromLTWH(
        startX, startY,
        crossProduct(HEIGHT_STAND, canvasSize.height),
        crossProduct(WIDTH_STAND, canvasSize.height),
      ),
      paint,
    );

    for(int i = 0; i < stand.tiles.length; i++){
      paint.color = createMaterialColor(Color(colorTilesMap[stand.tiles[i]]!));
      canvas.drawRect(
        Rect.fromLTWH(
          startX + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height),
          startY + i * (tileSize + tilePadding) + crossProduct(SIZE_OUTER_BORDER_STAND, canvasSize.height),
          tileSize,
          tileSize,
        ),
        paint,
      );
    }
  }

  double crossProduct(double valueToConvert, double canvasSize){
    const originalSizeCanvas = WIDTH_HEIGHT_BOARD + 2 * PADDING_BOARD_FOR_STANDS;
    return (valueToConvert * canvasSize)/originalSizeCanvas;
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
