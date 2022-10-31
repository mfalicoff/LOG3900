import 'package:flutter/cupertino.dart';

import '../constants/constants.dart';
import '../models/tile.dart';
import '../models/vec2.dart';
import 'info_client_service.dart';

class TapService with ChangeNotifier{
  static final TapService _clickService = TapService._internal();
  InfoClientService infoClientService = InfoClientService();
  bool isDragging = false;
  late double xPos;
  late double yPos;
  late Tile? draggedTile = null;

  bool tileClickedFromStand = false;

  factory TapService() {
    return _clickService;
  }

  TapService._internal();

  Tile onTapDownGetStandTile(double posX) {
    tileClickedFromStand = true;
    int finalIndex = getIndexOnStandLogicFromClick(posX);
    return infoClientService.player.stand[finalIndex];
  }

  Tile? onTapDownGetBoardTile(Vec2 vec) {
    tileClickedFromStand = false;
    return getClickedBoardTile(vec);
  }

  int getIndexOnStandLogicFromClick(double posX) {
    double constPosXYForStands =
        PADDING_BET_BOARD_AND_STAND_CORRECTED +
            WIDTH_HEIGHT_BOARD_CORRECTED / 2 -
            WIDTH_STAND_CORRECTED / 2 +
            SIZE_OUTER_BORDER_STAND;
    double posXCleaned = posX - constPosXYForStands;
    return (NUMBER_SLOT_STAND / (WIDTH_STAND_CORRECTED / posXCleaned)).floor() -1;
  }

  Tile? getClickedBoardTile(Vec2 vec ) {
    Vec2 idxCoords = getIndexOnBoardLogicFromClick(vec);
    if (idxCoords.x == DEFAULT_VALUE_NUMBER || idxCoords.y == DEFAULT_VALUE_NUMBER) {
      return null;
    }
    Tile clickedTile = infoClientService.game.board[idxCoords.y as int][idxCoords.x as int];
    // if the tile is old it means that this is not a temporary tile and
    // we don't want to be able to touch it
    if (clickedTile.old) {
      return null;
    } else {
      return clickedTile;
    }
  }

  Vec2 getIndexOnBoardLogicFromClick(Vec2 vec) {
    // we get rid of the border and the padding for the stands
    Vec2 coordsCleaned = Vec2();
    coordsCleaned.x = vec.x - PADDING_BOARD_FOR_STANDS_CORRECTED - PADDING_BET_BOARD_AND_STAND_CORRECTED;
    coordsCleaned.y = vec.y - PADDING_BOARD_FOR_STANDS_CORRECTED - PADDING_BET_BOARD_AND_STAND_CORRECTED;

    // veryfiying that we are on the board not elsewhere
    if (coordsCleaned.x < 0 || coordsCleaned.y < 0) {
      return Vec2.withParams(DEFAULT_VALUE_NUMBER, DEFAULT_VALUE_NUMBER);
    }

    Vec2 coordsIndexOnBoard = Vec2();
    coordsIndexOnBoard.x = (((1 / (WIDTH_BOARD_NOBORDER_CORRECTED / coordsCleaned.x)) * NUMBER_SQUARE_H_AND_W)).floor();
    coordsIndexOnBoard.y = (((1 / (WIDTH_BOARD_NOBORDER_CORRECTED / coordsCleaned.y)) * NUMBER_SQUARE_H_AND_W)).floor();

    if (
        coordsIndexOnBoard.x > NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.y > NUMBER_SQUARE_H_AND_W ||
            coordsIndexOnBoard.x <= 0 ||
            coordsIndexOnBoard.y <= 0
    ) {
      return Vec2.withParams(DEFAULT_VALUE_NUMBER, DEFAULT_VALUE_NUMBER);
    }
    return coordsIndexOnBoard;
  }

  void drawTileDraggedOnCanvas(Tile clickedTile, Vec2 mouseCoords) {
    isDragging = true;
    Vec2 boardIndexs = getIndexOnBoardLogicFromClick(mouseCoords);

    draggedTile = clickedTile;
    xPos = mouseCoords.x as double;
    yPos = mouseCoords.y as double;
    notifyListeners();
  }



}
