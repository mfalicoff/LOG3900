import 'package:client_leger/models/vec2.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:flutter/material.dart';

import '../constants/constants.dart';
import '../models/tile.dart';
import '../services/board_painter.dart';
import '../services/info_client_service.dart';
import '../services/socket_service.dart';

class GameBoard extends StatefulWidget {
  const GameBoard({Key? key}) : super(key: key);

  @override
  State<GameBoard> createState() => _GameBoardState();
}

class _GameBoardState extends State<GameBoard> {
  InfoClientService infoClientService = InfoClientService();
  TapService tapService = TapService();
  BoardPainter boardPainter = BoardPainter();
  final SocketService socketService = SocketService();

  bool touching = false;
  late Tile? clickedTile = Tile();
  late Vec2 clickedTileIndex;
  late Tile? draggedTile;

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
    tapService.addListener(refresh);
  }

  void refresh() {
    if (mounted) {
      setState(() {});
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
                  child: GestureDetector(
                    onPanStart: (details) {
                      touching = true;
                      Vec2 coordsClick = Vec2.withParams(
                          details.localPosition.dx, details.localPosition.dy);
                      if (areCoordsOnStand(coordsClick)) {
                        print('on stand');
                        clickedTile = tapService
                            .onTapDownGetStandTile(details.localPosition.dx);
                      } else if (areCoordsOnBoard(coordsClick)) {
                        clickedTile = tapService.onTapDownGetBoardTile(
                            Vec2.withParams(details.localPosition.dx,
                                details.localPosition.dy));
                        clickedTileIndex = tapService
                            .getIndexOnBoardLogicFromClick(coordsClick);
                        print(clickedTile);
                        print(clickedTileIndex.x);
                        print(clickedTileIndex.y);
                      }
                    },
                    onPanUpdate: (details) {
                      // print(clickedTile?.toJson());
                      // if (touching ||
                      //     (clickedTile == null) ||
                      //     clickedTile?.letter.value == '' ||
                      //     infoClientService.isTurnOurs) {
                      //   return;
                      // }
                      print(clickedTile?.toJson());
                      Vec2 coords = Vec2.withParams(
                          crossProductTest(details.localPosition.dx), crossProductTest(details.localPosition.dy));
                      // socketService.socket
                      //     .emit('tileDraggedOnCanvas', [clickedTile?.toJson(), coords.toJson()]);
                    },
                    child: CustomPaint(
                      painter: boardPainter,
                    ),
                  ))),
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

  bool areCoordsOnStand(Vec2 coords) {
    double heightStand = boardPainter.crossProduct(HEIGHT_STAND, 692);
    double widthStand = boardPainter.crossProduct(WIDTH_STAND, 692);
    double paddingBS =
        boardPainter.crossProduct(PADDING_BET_BOARD_AND_STAND, 692);
    double sizeOuterBoarderStand =
        boardPainter.crossProduct(SIZE_OUTER_BORDER_STAND, 692);
    double boardSize = boardPainter.crossProduct(WIDTH_HEIGHT_BOARD, 692);

    double paddingForStands = heightStand + paddingBS;
    double posXForStands = paddingForStands +
        sizeOuterBoarderStand +
        boardSize / 2 -
        widthStand / 2;
    print(posXForStands);

    double posYForStands =
        boardSize + paddingForStands + sizeOuterBoarderStand + paddingBS;

    if (coords.x > posXForStands &&
        coords.x < posXForStands + widthStand - sizeOuterBoarderStand * 2 &&
        coords.y > posYForStands &&
        coords.y < posYForStands + heightStand - sizeOuterBoarderStand * 2) {
      return true;
    } else {
      return false;
    }
  }

  bool areCoordsOnBoard(Vec2 coords) {
    double padBoardS = boardPainter.crossProduct(PADDING_BOARD_FOR_STANDS, 692);
    double sizeOUterBOard =
        boardPainter.crossProduct(SIZE_OUTER_BORDER_BOARD, 692);
    double boardSize = boardPainter.crossProduct(WIDTH_HEIGHT_BOARD, 692);

    double posXYStartForBoard = padBoardS + sizeOUterBOard;
    double posXYEndForBoard =
        posXYStartForBoard + boardSize - 2 * sizeOUterBOard;
    if (coords.x > posXYStartForBoard &&
        coords.x < posXYEndForBoard &&
        coords.y > posXYStartForBoard &&
        coords.y < posXYEndForBoard) {
      return true;
    } else {
      return false;
    }
  }

/*  void _changeBoard() {
    board.tiles = constBoard2;
  }*/

}
