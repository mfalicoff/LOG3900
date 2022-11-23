import 'package:client_leger/models/chat.dart';
import 'package:client_leger/models/chatroom.dart';
import 'package:client_leger/models/spectator.dart';
import 'package:client_leger/services/chat-service.dart';
import 'package:client_leger/services/tapService.dart';
import 'package:client_leger/services/timer.dart';
import 'package:flutter/cupertino.dart';
import 'package:restart_app/restart_app.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import '../constants/constants.dart';
import '../env/environment.dart';
import 'package:client_leger/constants/constants.dart' as constants;
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:just_audio/just_audio.dart';
import 'package:collection/collection.dart';
import 'dart:async';
import 'package:client_leger/utils/globals.dart' as globals;
import 'dart:developer';


import '../models/mock_dict.dart';
import '../models/game-server.dart';
import '../models/player.dart';
import '../models/room-data.dart';
import '../models/tile.dart';
import '../models/vec2.dart';
import 'users_controller.dart';
import 'info_client_service.dart';
import 'ranked.dart';
import '../models/game.dart';

class SocketService with ChangeNotifier {
  static final SocketService _socketService = SocketService._internal();

  RankedService rankedService = RankedService();
  InfoClientService infoClientService = InfoClientService();
  TimerService timerService = TimerService();
  TapService tapService = TapService();
  Controller controller = Controller();
  ChatService chatService = ChatService();
  late String gameId;
  int count = 1;

  late IO.Socket socket;

  factory SocketService() {
    return _socketService;
  }

  SocketService._internal() {
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
    chatRoomHandler();
  }

  roomManipulationHandler() {
    socket.on('addElementListRoom', (data) {
      RoomData room = RoomData.fromJson(data);
      var exist =
          infoClientService.rooms.where((element) => element.name == room.name);
      if (exist.isEmpty) {
        infoClientService.addRoom(room);
      }
    });

    socket.on('removeElementListRoom', (roomNameToDelete) {
      infoClientService.removeRoom(roomNameToDelete);
    });
  }

  otherSocketOn() {

    socket.on('matchFound', (_) {
    rankedService.matchHasBeenFound();
    });

<<<<<<< HEAD
=======
    socket.on('startGame', (roomName) {
      socket.emit('startGame', roomName);
    });

>>>>>>> b46a060e71cb944f6aeeebced7e15cfecd695812
    socket.on("createRankedGame", (data) async {
      String gameName = data[0];
      String playerName = data[1];
      MockDict mockDict = MockDict("Dictionnaire français par défaut","Ce dictionnaire contient environ trente mille mots français");
      socket.emit("dictionarySelected", mockDict);
<<<<<<< HEAD
      socket.emit("createRoomAndGame", [
                data[0],
                data[1],
=======
      socket.emit("createRoomAndGame", CreateGameModel(
                gameName,
                playerName,
>>>>>>> b46a060e71cb944f6aeeebced7e15cfecd695812
                1,
                constants.MODE_RANKED,
                false,
                '',
      ));
      rankedService.closeModal();
    });

    socket.on("joinRankedRoom", (data){
      String socketId = data[1];
      String gameName = data[0];
      socket.emit("joinRoom",[gameName, socketId]);
      socket.emit("spectWantsToBePlayer",[gameName, socketId]);
    });

    // socket.on("closeModalOnRefuse", (_) {
    //   log('what')
    //   rankedService.closeModal();
    // });

    // socket.on("closeModal", (_) {
    //   rankedService.closeModal();
    // });

    socket.on('messageServer', (message) {
      print(message);
    });

    socket.on('forceLogout', (_) async {
      globals.userLoggedIn.clear();
      Restart.restartApp();
    });

    socket.on('SendDictionariesToClient', (dictionaries) {
      infoClientService.updateDictionaries(dictionaries);
    });

    socket.on('DictionaryDeletedMessage', (message) {});

    socket.on('SendBeginnerVPNamesToClient', (namesVP) {});

    socket.on('SendExpertVPNamesToClient', (namesVP) {});

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

    socket.on("sendLetterReserve", (letterReserveArr) {
      infoClientService.letterReserve =
          letterReserveArr.map<String>((e) => e.toString()).toList();
    });

    socket.on('soundPlay', (soundName) async {
      if (!infoClientService.soundDisabled) {
        final player = AudioPlayer(); // Create a player
        await player.setUrl(
            "asset:assets/audios/$soundName"); // Schemes: (https: | file: | asset: )
        await player.play();
        await player.stop();
      }
    });
  }

  gameUpdateHandler() {
    socket.on('playerAndStandUpdate', (player) {
      infoClientService.updatePlayer(player);
      infoClientService.notifyListeners();
      chatService.notifyListeners();
    });

    socket.on('gameBoardUpdate', (game) {
      infoClientService.updateGame(game);
      tapService.draggedTile = null;
      tapService.notifyListeners();
      infoClientService.notifyListeners();
      chatService.notifyListeners();
      if (GameServer.fromJson(game).gameFinished && count == 1) {
        timerService.clearGameTimer();
        infoClientService.notifyListeners();
        count++;
      }
    });

    socket.on('playersSpectatorsUpdate', (data) {
      int idxExistingRoom = infoClientService.rooms
          .indexWhere((element) => element.name == data['roomName']);
      if (idxExistingRoom == -1) {
        return;
      }
      infoClientService.actualRoom = infoClientService.rooms[idxExistingRoom];
      List<Player> updatedPlayers = Player.createPLayersFromArray(data);
      infoClientService.rooms[idxExistingRoom].players = updatedPlayers;
      List<Spectator> updatedSpecs = Spectator.createSpectatorsFromArray(data);
      infoClientService.rooms[idxExistingRoom].spectators = updatedSpecs;

      Player? tmpPlayer = infoClientService.actualRoom.players.firstWhereOrNull(
          (player) => player.name == infoClientService.playerName);
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
      chatService.notifyListeners();
    });

    socket.on('creatorShouldBeAbleToStartGame', (creatorCanStart) {
      infoClientService.creatorShouldBeAbleToStartGame = creatorCanStart;
    });

    socket.on('changeIsTurnOursStatus', (isTurnOurs) {
      infoClientService.isTurnOurs = isTurnOurs;
    });
    socket.on('savedGameId', (id) {
      gameId = id;
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
      infoClientService.powerUsedForTurn = false;
      tapService.resetVariablePlacement();
      if (currentNamePlayerPlaying == infoClientService.playerName) {
        infoClientService.displayTurn = "C'est votre tour !";
        infoClientService.isTurnOurs = true;
        infoClientService.notifyListeners();
      } else {
        Player playerPlaying = infoClientService.actualRoom.players
            .singleWhere((player) => player.name == currentNamePlayerPlaying);
        infoClientService.displayTurn =
            "C'est au tour de ${playerPlaying.name} de jouer !";
        infoClientService.isTurnOurs = false;
      }

      timerService.clearTimer();
      timerService.startTimer(minutesByTurn);
      infoClientService.notifyListeners();
    });

    socket.on('setTimeoutTimerStart', (_) {
      tapService.lettersDrawn = '';
      setTimeoutForTimer();
      timerService.startGameTimer();
    });

    socket.on('stopTimer', (_) {
      tapService.lettersDrawn = '';
      timerService.clearTimer();
    });

    socket.on('addSecsToTimer', (secsToAdd){
      timerService.addSecsToTimer(secsToAdd);
    });

    socket.on('askTimerStatus', (_) {
      socket.emit('timerStatus', timerService.secondsValue);
    });
  }

  canvasActionsHandler() {
    socket.on('drawBorderTileForTmpHover', (boardIndexs) {});

    socket.on('tileDraggedOnCanvas', (data) {
      Tile clickedTile = Tile.fromJson(data[0]);
      Vec2 mouseCoords = Vec2.fromJson(data[1]);
      mouseCoords.x = crossProductGlobal(mouseCoords.x.toDouble());
      mouseCoords.y = crossProductGlobal(mouseCoords.y.toDouble());
      tapService.drawTileDraggedOnCanvas(clickedTile, mouseCoords);
    });
  }

  chatRoomHandler() {
    socket.on('setChatRoom', (data) {
      var chatRoom = ChatRoom.fromJson(data);

      //if the room is already present we delete it to set the newer one
      //it should never happened though
      if (chatService.rooms.contains(chatRoom)) {
        chatService.rooms
            .removeWhere((element) => element.name == chatRoom.name);
        print("Should never go here in SocketService:setChatRoom");
      }
      //if the room received is general it means we are getting all the room
      //and this is the start of the app
      if (chatRoom.name == "general") {
        chatService.rooms.clear();
      }
      chatService.rooms.add(chatRoom);
      if (chatRoom.name == "general") {
        chatService.currentChatRoom = chatService.rooms[0];
      }
      chatService.chatRoomWanted = null;
      chatService.notifyListeners();
    });
    socket.on('addMsgToChatRoom', (data) async {
      var chatRoomName = data[0];
      var newMsg = data[1];
      var roomElement = chatService.rooms
          .firstWhere((element) => element.name == chatRoomName);
      int indexRoom = chatService.rooms.indexOf(roomElement);
      if (indexRoom != -1) {
        chatService.rooms[indexRoom].chatHistory
            .add(ChatMessage.fromJson(newMsg));
        if (chatService.currentChatRoom.name !=
            chatService.rooms[indexRoom].name || !chatService.isDrawerOpen) {
          chatService.rooms[indexRoom].isUnread = true;
        }
      } else {
        print("error in SocketService:addMsgToChatRoom");
      }
      chatService.notifyListeners();
      final player = AudioPlayer(); // Create a player
      await player.setUrl(
          "asset:assets/audios/notification-small.mp3"); // Schemes: (https: | file: | asset: )
      await player.play();
      await player.stop();
    });
  }

  updateUiBeforeStartGame(List<Player> players) {
    if (infoClientService.actualRoom.numberRealPlayer >= MIN_PERSON_PLAYING) {
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
      if (timerService.secondsValue <= 0 &&
          infoClientService.game.masterTimer == socket.id) {
        socket.emit('turnFinished');
      }
      if (infoClientService.game.gameFinished) {
        tapService.lettersDrawn = '';
        timer.cancel();
      }
    });
  }
}

