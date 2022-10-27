import 'package:client_leger/models/spectator.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import '../env/environment.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:collection/collection.dart';

import '../models/player.dart';
import 'info_client_service.dart';



class SocketService with ChangeNotifier{

  static final SocketService _socketService = SocketService._internal();

  InfoClientService infoClientService = InfoClientService();
  late IO.Socket socket;

  factory SocketService() {
    return _socketService;
  }

  SocketService._internal(){
    socket = IO.io(
        Environment().config?.serverURL,
        OptionBuilder().setTransports(['websocket']) // for Flutter or Dart VM
            .setExtraHeaders({'foo': 'bar'}) // optional
            .build());
    OptionBuilder().setTransports(['websocket']);
    socket.emit("new-user", globals.userLoggedIn.username);

    socketListen();

  }

  socketListen() {
    roomManipulationHandler();
    otherSocketOn();
    gameUpdateHandler();
    timerHandler();
    canvasActionsHandler();
  }

  roomManipulationHandler() {

    socket.on('addElementListRoom', (data) {

    });

    socket.on('removeElementListRoom', (roomNameToDelete) {

    });

    socket.on('roomChangeAccepted', (page) {

    });

  }

  otherSocketOn() {

    socket.on('messageServer', (message) {

    });

    socket.on('SendDictionariesToClient', (dictionaries) {

    });

    socket.on('DictionaryDeletedMessage', (message) {

    });

    socket.on('SendBeginnerVPNamesToClient', (namesVP) {

    });

    socket.on('SendExpertVPNamesToClient', (namesVP) {

    });

    socket.on('isSpectator', (isSpectator) {

    });

    socket.on('askForEntrance', (data) {

    });

    socket.on('gameOver', (data) {

    });

  }

  gameUpdateHandler() {
    socket.on('playerAndStandUpdate', (player) {

    });

    socket.on('gameBoardUpdate', (game) {

    });

    socket.on('playersSpectatorsUpdate', (data) {
      int idxExistingRoom = infoClientService.rooms.indexWhere((element) => element.name == data['roomName']);
      infoClientService.actualRoom = infoClientService.rooms[idxExistingRoom];
      infoClientService.rooms[idxExistingRoom].players = Player.createPLayersFromArray(data);
      if (infoClientService.isSpectator) {
        // draw spec stand
      }
      infoClientService.rooms[idxExistingRoom].spectators = Spectator.createSpectatorsFromArray(data);

      Player? tmpPlayer = infoClientService.actualRoom.players.firstWhereOrNull((player) => player.name == infoClientService.playerName);
      if (tmpPlayer != null) {
        infoClientService.player = tmpPlayer;
      }
      notifyListeners();
    });

    socket.on('findTileToPlaceArrow', (realPosInBoardPx) {

    });

    socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) {

    });

    socket.on('changeIsTurnOursStatus', (isTurnOurs) {

    });
  }

  timerHandler() {

    socket.on('displayChangeEndGame', (displayChange) {

    });

    socket.on('startClearTimer', (data) {

    });

    socket.on('setTimeoutTimerStart', (_) {

    });

    socket.on('stopTimer', (_) {

    });

  }

  canvasActionsHandler() {
    socket.on('clearTmpTileCanvas', (_) {

    });

    socket.on('drawBorderTileForTmpHover', (boardIndexs) {

    });

    socket.on('tileDraggedOnCanvas', (data) {
      // Should switch to type tile when done
      dynamic clickedTile = data[0];
      // should switch to type vec2
      dynamic mouseCoords = data[1];
    });

    socket.on('drawVerticalArrow', (arrowCoords) {

    });

    socket.on('drawHorizontalArrow', (arrowCoords) {

    });
  }

}
