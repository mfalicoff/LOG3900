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
  late Vec2 lastPosition;

  // These are needed for some bizarre reason the values are not updated correctly when passing them to the dragging methods so we copy them manually
  late Vec2 test;
  late Vec2 nextTest;

  @override
  void initState() {
    super.initState();

    infoClientService.addListener(refresh);
    infoClientService.player.addListener(refresh);
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
                      print('starting');
                      touching = true;
                      Vec2 coordsClick = Vec2.withParams(
                          details.localPosition.dx, details.localPosition.dy);
                      print(coordsClick.toJson());
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
                        // print(clickedTile);
                        // print(clickedTileIndex.x);
                        // print(clickedTileIndex.y);
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
                      // print(clickedTile?.toJson());
                      Vec2 coords = Vec2.withParams(
                          crossProductTest(details.localPosition.dx), crossProductTest(details.localPosition.dy));
                      lastPosition = Vec2.withParams(details.localPosition.dx, details.localPosition.dy);
                      print(clickedTile?.toJson());
                      socketService.socket
                          .emit('tileDraggedOnCanvas', [clickedTile!.toJson(), coords.toJson()]);
                    },
                    onPanEnd: (details) {
                      print("end");
                      touching = false;
                      print(tapService.tileClickedFromStand);
                      Vec2 coordsTapped = lastPosition;
                      nextTest = lastPosition;
                      print(coordsTapped.toJson());
                      // clickedTile?.position.x1 = crossProductGlobal1(clickedTile!.position.x1);
                      // clickedTile?.position.y1 = crossProductGlobal1(clickedTile!.position.y1);

                      if(areCoordsOnBoard(coordsTapped) && infoClientService.isTurnOurs) {
                        if(clickedTile != null && clickedTile?.letter.value != '') {
                          if(tapService.tileClickedFromStand) {
                            tapService.onStandToBoardDrop(coordsTapped, clickedTile!, socketService.socket);
                            test = coordsTapped;
                          } else {
                            tapService.onBoardToBoardDrop(coordsTapped, clickedTile!, test, nextTest, socketService.socket);
                            test = coordsTapped;
                          }
                        }
                      } else if(areCoordsOnStand(coordsTapped)) {
                        print("dropping on stand");
                        print(clickedTile?.toJson());
                        print(!tapService.tileClickedFromStand);
                        print(infoClientService.isTurnOurs);
                        if(clickedTile != null && clickedTile?.letter.value != '' && !tapService.tileClickedFromStand && infoClientService.isTurnOurs) {
                          print("goig to stand");
                          tapService.onBoardToStandDrop(coordsTapped, clickedTile!, clickedTileIndex, socketService.socket);
                        } else {
                          tapService.onTapStand(coordsTapped, socketService.socket);
                        }
                      }

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
    num paddingForStands = HEIGHT_STAND_CORRECTED + PADDING_BET_BOARD_AND_STAND_CORRECTED;
    num posXForStands =
        paddingForStands + SIZE_OUTER_BORDER_STAND_CORECTED + WIDTH_HEIGHT_BOARD_CORRECTED / 2 - WIDTH_STAND_CORRECTED / 2;
    num posYForStands =
        WIDTH_HEIGHT_BOARD_CORRECTED + paddingForStands + SIZE_OUTER_BORDER_STAND_CORECTED + PADDING_BET_BOARD_AND_STAND_CORRECTED;
    if (
    coords.x > posXForStands &&
        coords.x < posXForStands + WIDTH_STAND_CORRECTED - SIZE_OUTER_BORDER_STAND_CORECTED * 2 &&
        coords.y > posYForStands &&
        coords.y < posYForStands + HEIGHT_STAND_CORRECTED - SIZE_OUTER_BORDER_STAND_CORECTED * 2
    ) {
      return true;
    } else {
      return false;
    }
  }

  bool areCoordsOnBoard(Vec2 coords) {
    num posXYStartForBoard = PADDING_BOARD_FOR_STANDS_CORRECTED + SIZE_OUTER_BORDER_BOARD_CORRECTED;
    num posXYEndForBoard = posXYStartForBoard + WIDTH_HEIGHT_BOARD_CORRECTED - 2 * SIZE_OUTER_BORDER_BOARD_CORRECTED;
    if (coords.x > posXYStartForBoard && coords.x < posXYEndForBoard && coords.y > posXYStartForBoard && coords.y < posXYEndForBoard) {
      return true;
    } else {
      return false;
    }
  }

/*  void _changeBoard() {
    board.tiles = constBoard2;
  }*/

}
