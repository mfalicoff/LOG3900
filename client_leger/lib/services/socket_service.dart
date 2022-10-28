import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/services/timer.dart';
import 'package:flutter/cupertino.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import '../env/environment.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:collection/collection.dart';
import 'dart:async';


import '../models/player.dart';
import '../models/room-data.dart';
import 'info_client_service.dart';



class SocketService with ChangeNotifier{

  static final SocketService _socketService = SocketService._internal();

  InfoClientService infoClientService = InfoClientService();
  TimerService timerService = TimerService();

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
      RoomData room = RoomData.fromJson(data);
      var exist = infoClientService.rooms.where((element) => element.name == room.name);
      if(exist.isEmpty){
        infoClientService.rooms.add(room);
        notifyListeners();
      }
    });

    socket.on('removeElementListRoom', (roomNameToDelete) {
      infoClientService.rooms.removeWhere((element) => element.name == roomNameToDelete);
      notifyListeners();
    });

    // socket.on('roomChangeAccepted', (page) {
    //
    // });

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
      infoClientService.isSpectator = isSpectator;
    });

    socket.on('askForEntrance', (data) {

    });

    socket.on('gameOver', (data) {
      infoClientService.game.gameFinished = true;
    });

  }

  gameUpdateHandler() {
    socket.on('playerAndStandUpdate', (player) {
      infoClientService.updatePlayer(player);
      // TODO
      // setTimeout(() => {
      // this.drawingService.reDrawStand(player.stand, this.infoClientService.letterBank);
      // }, GlobalConstants.WAIT_FOR_CANVAS_INI);
    });

    socket.on('gameBoardUpdate', (game) {
      infoClientService.updateGame(game);

      // TODO
      // setTimeout(() => {
      // this.drawingBoardService.reDrawBoard(this.socket, game.bonusBoard, game.board, this.infoClientService.letterBank);
      // }, GlobalConstants.WAIT_FOR_CANVAS_INI);
    });

    socket.on('playersSpectatorsUpdate', (data) {
      int idxExistingRoom = infoClientService.rooms.indexWhere((element) => element.name == data['roomName']);
      infoClientService.actualRoom = infoClientService.rooms[idxExistingRoom];
      infoClientService.rooms[idxExistingRoom].players = Player.createPLayersFromArray(data);
      if (infoClientService.isSpectator) {
        // TODO
        // setTimeout(() => {
        // this.drawingService.drawSpectatorStands(players);
        // }, GlobalConstants.WAIT_FOR_CANVAS_INI);
      }
      infoClientService.rooms[idxExistingRoom].spectators = Spectator.createSpectatorsFromArray(data);

      Player? tmpPlayer = infoClientService.actualRoom.players.firstWhereOrNull((player) => player.name == infoClientService.playerName);
      if (tmpPlayer != null) {
        infoClientService.player = tmpPlayer;
      }

      // TODO
      // do we need this?
      // this.updateUiForSpectator(this.infoClientService.game);
      // // update display turn to show that we are waiting for creator or other players
      // if (!this.infoClientService.game.gameStarted) {
      //   this.updateUiBeforeStartGame(players);
      // }

      infoClientService.notifyListeners();
    });

    socket.on('findTileToPlaceArrow', (realPosInBoardPx) {

    });

    socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) {
      infoClientService.creatorShouldBeAbleToStartGame = creatorCanStart;
    });

    socket.on('changeIsTurnOursStatus', (isTurnOurs) {
      infoClientService.isTurnOurs = isTurnOurs;
    });
  }

  timerHandler() {

    socket.on('displayChangeEndGame', (displayChange) {
      displayChangeEndGameCallBack(displayChange);
    });

    socket.on('startClearTimer', (data) {
      // this.drawingBoardService.lettersDrawn = '';
      num minutesByTurn = data["minutesByTurn"];
      String currentNamePlayerPlaying = data["currentNamePlayerPlaying"];

      if(currentNamePlayerPlaying == infoClientService.playerName) {
        infoClientService.displayTurn = "C'est votre tour !";
        infoClientService.isTurnOurs = true;

      } else {
        Player playerPlaying = infoClientService.actualRoom.players.singleWhere((player) => player.name == currentNamePlayerPlaying);
        infoClientService.displayTurn = "C'est au tour de ${playerPlaying.name} de jouer !";
        infoClientService.isTurnOurs = false;
      }

      timerService.clearTimer();
      timerService.startTimer(minutesByTurn);

    });

    socket.on('setTimeoutTimerStart', (_) {
      // this.drawingBoardService.lettersDrawn = '';
      setTimeoutForTimer();
    });

    socket.on('stopTimer', (_) {
      // this.drawingBoardService.lettersDrawn = '';
      timerService.clearTimer();
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

  displayChangeEndGameCallBack(String displayChange) {
    infoClientService.displayTurn = displayChange;
  }

  setTimeoutForTimer() {
    int oneSecond = 1000;
    Timer.periodic(Duration(milliseconds: oneSecond), (timer) {
      if (timerService.secondsValue <= 0 && infoClientService.game.masterTimer == socket.id) {
        socket.emit('turnFinished');
      }
      if (infoClientService.game.gameFinished) {
        // this.drawingBoardService.lettersDrawn = '';
        timer.cancel();
      }
    });
  }


}
