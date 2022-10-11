import 'package:client_leger/constants/constants_test.dart';
import 'package:flutter/material.dart';

import '../services/board_painter.dart';

class GameBoard extends StatefulWidget {
  const GameBoard({Key? key}) : super(key: key);

  @override
  State<GameBoard> createState() => _GameBoardState();
}

class _GameBoardState extends State<GameBoard> {
  @override
  Widget build(BuildContext context) {
    // return CustomPaint(painter: BoardPainter(),);
    return LayoutBuilder(builder: (_, constraints) => Container(
      width: constraints.maxWidth < constraints.maxHeight ? constraints.maxWidth : constraints.maxHeight,
      height: constraints.maxWidth < constraints.maxHeight ? constraints.maxWidth : constraints.maxHeight,
      color: Colors.yellow,
      child: CustomPaint(painter: BoardPainter(board),),
    ));
  }
}
