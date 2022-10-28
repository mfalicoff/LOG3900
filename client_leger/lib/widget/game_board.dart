import 'package:client_leger/constants/constants_test.dart';
import 'package:flutter/material.dart';

import '../models/board.dart';
import '../services/board_painter.dart';
import '../services/info_client_service.dart';

class GameBoard extends StatefulWidget {
  const GameBoard({Key? key}) : super(key: key);

  @override
  State<GameBoard> createState() => _GameBoardState();
}

class _GameBoardState extends State<GameBoard> {
  InfoClientService infoClientService = InfoClientService();
  Board board = Board(constBoard1);

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
  }

  void refresh() {
    if(mounted){
      setState(() {
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        LayoutBuilder(
          builder: (_, constraints) => Container(
              width: constraints.maxWidth < constraints.maxHeight
                  ? constraints.maxWidth
                  : constraints.maxHeight,
              height: constraints.maxWidth < constraints.maxHeight
                  ? constraints.maxWidth
                  : constraints.maxHeight,
              child: Padding(
                padding: const EdgeInsets.all(10),
                child: CustomPaint(
                  painter: BoardPainter(board),
                ),
              )),
        ),
        /*ElevatedButton(
          style: ButtonStyle(
            padding: MaterialStateProperty.all(
              const EdgeInsets.symmetric(vertical: 18.0, horizontal: 40.0),
            ),
            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10.0),
              ),
            ),
          ),
          onPressed: _changeBoard,
          child: Text(
            "Change",
            style: TextStyle(
                fontSize: 20, color: Theme.of(context).colorScheme.primary),
          ),
        ),*/
      ],
    );
  }

/*  void _changeBoard() {
    board.tiles = constBoard2;
  }*/


}
