import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/timer.dart';
import 'package:restart_app/restart_app.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import '../constants/constants.dart';
import '../env/environment.dart';
import 'package:client_leger/constants/constants.dart' as constants;
import 'package:collection/collection.dart';
import 'dart:async';
import 'package:client_leger/utils/globals.dart' as globals;
import 'dart:developer';


import '../models/mock_dict.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/tile.dart';
import '../models/vec2.dart';
import 'controller.dart';
import 'info_client_service.dart';
import 'ranked.dart';



class SocketService{

  static final SocketService _socketService = SocketService._internal();

  RankedService rankedService = RankedService();
  InfoClientService infoClientService = InfoClientService();
  TimerService timerService = TimerService();
  TapService tapService = TapService();
  Controller controller = Controller();


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
        infoClientService.addRoom(room);
      }
    });

    socket.on('removeElementListRoom', (roomNameToDelete) {
      infoClientService.removeRoom(roomNameToDelete);
    });

    // socket.on('roomChangeAccepted', (page) {
    //
    // });

  }

  otherSocketOn() {

    socket.on('matchFound', (_) {
    rankedService.matchHasBeenFound();
    });

    socket.on("createRankedGame", (name) async {
      MockDict mockDict = MockDict("Dictionnaire français par défaut","Ce dictionnaire contient environ trente mille mots français");
      socket.emit("dictionarySelected", mockDict);
      socket.emit("createRoomAndGame", [
                name,
                name,
                1,
                false,
                constants.MODE_RANKED,
                'beginner',
                false,
                '',
            ]);
    });

    socket.on("joinRankedRoom", (data){
      String socketId = data[1];
      String gameName = data[0];
      socket.emit("joinRoom",[gameName, socketId]);
      socket.emit("spectWantsToBePlayer",[gameName, socketId]);
    });

    socket.on("closeModalOnRefuse", (_) {
      rankedService.closeModal();
    });

    socket.on("closeModal", (_) {
      rankedService.closeModal();
    });

    socket.on('messageServer', (message) {

    });

    socket.on('forceLogout', (_) async {
      globals.userLoggedIn.clear();
      Restart.restartApp();
    });

    socket.on('SendDictionariesToClient', (dictionaries) {
      infoClientService.updateDictionaries(dictionaries);
    });

    socket.on('DictionaryDeletedMessage', (message) {

    });

    socket.on('SendBeginnerVPNamesToClient', (namesVP) {

    });

    socket.on('SendExpertVPNamesToClient', (namesVP) {

    });

    socket.on('isSpectator', (isSpectator) {
      infoClientService.isSpectator = isSpectator;
      infoClientService.notifyListeners();
    });

    socket.on('askForEntrance', (data) {
      infoClientService.askForEntrance(data);
    });

    socket.on('gameOver', (data) {
      infoClientService.game.gameFinished = true;
    });

  }

  gameUpdateHandler() {
    socket.on('playerAndStandUpdate', (player) {
      infoClientService.updatePlayer(player);
      infoClientService.notifyListeners();
      // setTimeout(() => {
    });

    socket.on('gameBoardUpdate', (game) {
      infoClientService.updateGame(game);
      tapService.draggedTile = null;
      tapService.notifyListeners();

      // TODO
      // setTimeout(() => {
      // this.drawingBoardService.reDrawBoard(this.socket, game.bonusBoard, game.board, this.infoClientService.letterBank);
      // }, GlobalConstants.WAIT_FOR_CANVAS_INI);
    });

    socket.on('playersSpectatorsUpdate', (data) {
      int idxExistingRoom = infoClientService.rooms.indexWhere((element) => element.name == data['roomName']);
      infoClientService.actualRoom = infoClientService.rooms[idxExistingRoom];
      List<Player> updatedPlayers = Player.createPLayersFromArray(data);
      infoClientService.rooms[idxExistingRoom].players = updatedPlayers;
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
      if (!infoClientService.game.gameStarted) {
        updateUiBeforeStartGame(updatedPlayers);
      }

      infoClientService.notifyListeners();
    });

    socket.on('findTileToPlaceArrow', (realPosInBoardPx) {
        //Est-ce nécessaire pour le mobile? - nope!
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
      tapService.resetVariablePlacement();

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
      infoClientService.notifyListeners();

    });

    socket.on('setTimeoutTimerStart', (_) {
      tapService.lettersDrawn = '';
      setTimeoutForTimer();
    });

    socket.on('stopTimer', (_) {
      tapService.lettersDrawn = '';
      timerService.clearTimer();
    });

  }

  canvasActionsHandler() {
    socket.on('clearTmpTileCanvas', (_) {

    });

    socket.on('drawBorderTileForTmpHover', (boardIndexs) {

    });

    socket.on('tileDraggedOnCanvas', (data) {
      Tile clickedTile = Tile.fromJson(data[0]);
      Vec2 mouseCoords = Vec2.fromJson(data[1]);
      mouseCoords.x = crossProductGlobal(mouseCoords.x.toDouble());
      mouseCoords.y = crossProductGlobal(mouseCoords.y.toDouble());
      tapService.drawTileDraggedOnCanvas(clickedTile, mouseCoords);
    });

    socket.on('drawVerticalArrow', (arrowCoords) {

    });

    socket.on('drawHorizontalArrow', (arrowCoords) {

    });
  }

  updateUiBeforeStartGame(List<Player> players) {
    if(infoClientService.actualRoom.numberRealPlayer >= MIN_PERSON_PLAYING) {
      infoClientService.displayTurn = WAITING_FOR_CREATOR;
    } else {
      infoClientService.displayTurn = WAIT_FOR_OTHER_PLAYERS;
    }
  }

  displayChangeEndGameCallBack(String displayChange) {
    infoClientService.displayTurn = displayChange;
    infoClientService.notifyListeners();
  }

  setTimeoutForTimer() {
    int oneSecond = 1000;
    Timer.periodic(Duration(milliseconds: oneSecond), (timer) {
      if (timerService.secondsValue <= 0 && infoClientService.game.masterTimer == socket.id) {
        socket.emit('turnFinished');
      }
      if (infoClientService.game.gameFinished) {
        tapService.lettersDrawn = '';
        timer.cancel();
      }
    });
  }

}

