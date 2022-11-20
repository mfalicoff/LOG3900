import 'dart:async';

import 'package:client_leger/models/chatroom.dart';
import 'package:client_leger/services/chat-service.dart';
import 'package:flutter/material.dart';

import 'package:client_leger/utils/globals.dart' as globals;
import 'package:flutter/scheduler.dart';

import '../screens/search_page_chatRoom.dart';
import '../services/info_client_service.dart';
import '../services/socket_service.dart';
import '../utils/utils.dart';

class ChatPanelOpenButton extends StatefulWidget {
  const ChatPanelOpenButton({Key? key}) : super(key: key);

  @override
  State<ChatPanelOpenButton> createState() => _ChatPanelOpenButton();
}

class _ChatPanelOpenButton extends State<ChatPanelOpenButton> {
  ChatService chatService = ChatService();

  @override
  void initState() {
    super.initState();
    chatService.addListener(refresh);
  }

  refresh() {
    if (mounted) {
      setState(() {
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
        style: ButtonStyle(
            padding: MaterialStateProperty.all(
              const EdgeInsets.symmetric(vertical: 18.0, horizontal: 0.0),
            ),
            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(100.0)))),
        onPressed: () {
          Scaffold.of(context).openEndDrawer();
        },
        child: Row(
          children: [
            const Icon(Icons.chat),
            chatService.isThereAChatUnread() == true
                ? Container(
                    decoration: BoxDecoration(
                      color: Colors.red,
                      borderRadius: BorderRadius.circular(7),
                    ),
                    constraints: const BoxConstraints(
                      minWidth: 10,
                      minHeight: 10,
                    ),
                    child: const SizedBox(
                      width: 1,
                      height: 1,
                    ),
                  )
                : Container(),
          ],
        ));
  }
}

class ChatPanel extends StatefulWidget {
  bool isInGame;

  ChatPanel({Key? key, required this.isInGame}) : super(key: key);

  @override
  State<ChatPanel> createState() => _ChatPanelState();
}

class _ChatPanelState extends State<ChatPanel> {
  InfoClientService infoClientService = InfoClientService();
  ChatService chatService = ChatService();
  final SocketService socketService = SocketService();

  final ScrollController _roomScrollController = ScrollController();
  final ScrollController _chatScrollController = ScrollController();
  final TextEditingController msgController = TextEditingController();
  final FocusNode _focusNode = FocusNode();

  String message = "";

  @override
  void initState() {
    super.initState();

    if (widget.isInGame) {
      if (chatService.rooms[0].name != 'game') {
        ChatRoom gameChat = ChatRoom(name: 'game', participants: []);
        gameChat.chatHistory = infoClientService.player.chatHistory;
        chatService.rooms.insert(0, gameChat);
      }
    } else {
      if(!widget.isInGame && chatService.rooms[0].name == 'game') {
        chatService.rooms.removeAt(0);
        chatService.currentChatRoom = chatService.rooms[0];
      }
    }
    infoClientService.addListener(refresh);
    chatService.addListener(refresh);
  }

  void scrollMessages() {
    _chatScrollController.animateTo(
      _chatScrollController.position.maxScrollExtent + 50,
      curve: Curves.easeOut,
      duration: const Duration(milliseconds: 500),
    );
  }

  void refresh() {
    if (mounted) {
      setState(() {
        if (widget.isInGame && chatService.rooms[0].name == 'game') {
          if (infoClientService.isSpectator) {
            var idxSpectator = infoClientService.actualRoom.spectators
                .indexWhere(
                    (element) => element.name == infoClientService.playerName);
            if (idxSpectator != -1) {
              chatService.rooms[0].chatHistory = infoClientService
                  .actualRoom.spectators[idxSpectator].chatHistory;
            }
          } else {
            chatService.rooms[0].chatHistory =
                infoClientService.player.chatHistory;
          }
        }
        scrollMessages();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    SchedulerBinding.instance.addPostFrameCallback((_) {
      _chatScrollController
          .jumpTo(_chatScrollController.position.maxScrollExtent + 30);
      if (chatService.currentChatRoom.isUnread) {
        chatService.currentChatRoom.isUnread = false;
        chatService.notifyListeners();
      }
    });
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        ConstrainedBox(
          constraints: const BoxConstraints(
            minWidth: 50,
            maxWidth: 200,
          ),
          child: Container(
            decoration: BoxDecoration(
              border: Border.all(),
              color: Theme.of(context).colorScheme.secondary,
            ),
            alignment: Alignment.center,
            child: Column(
              children: [
                Text(
                  "Rooms",
                  style: TextStyle(
                      color: Theme.of(context).colorScheme.primary,
                      fontSize: 30,
                      decoration: TextDecoration.none),
                ),
                CreateRoomDialog(
                  notifyParent: refresh,
                ),
                TextButton(
                  onPressed: _toSearchChatRoomPage,
                  style: TextButton.styleFrom(
                    side: BorderSide(
                        width: 2.0,
                        color: Theme.of(context).colorScheme.primary),
                  ),
                  child: Text(
                    "Search Room",
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 14,
                        decoration: TextDecoration.none),
                  ),
                ),
                Expanded(
                  child: Container(
                      decoration: const BoxDecoration(
                          border: Border(
                              top: BorderSide(color: Colors.black, width: 1))),
                      child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: chatService.rooms.length,
                          controller: _roomScrollController,
                          itemBuilder: (BuildContext context, int index) {
                            return GestureDetector(
                              onTap: () {
                                chatService.currentChatRoom =
                                    chatService.rooms[index];
                                chatService.currentChatRoom.isUnread = false;
                                refresh();
                                scrollMessages();
                                chatService.notifyListeners();
                              },
                              child: Container(
                                alignment: Alignment.center,
                                padding: const EdgeInsets.symmetric(
                                    vertical: 5, horizontal: 5),
                                decoration: BoxDecoration(
                                    border: Border.all(
                                        color: Theme.of(context)
                                            .colorScheme
                                            .primary,
                                        width: 2),
                                    borderRadius: const BorderRadius.all(
                                        Radius.circular(0)),
                                    color: (chatService.currentChatRoom ==
                                            chatService.rooms[index]
                                        ? Theme.of(context).colorScheme.primary
                                        : Theme.of(context)
                                            .colorScheme
                                            .secondary)),
                                child: Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    chatService.rooms[index].isUnread == true &&
                                            chatService.currentChatRoom.name !=
                                                chatService.rooms[index].name
                                        ? notificationContainer(Colors.red)
                                        : notificationContainer(Theme.of(context).colorScheme.secondary.withOpacity(0)),
                                    Expanded(
                                      child: Text(
                                        chatService.rooms[index].name,
                                        style: TextStyle(
                                          color: (chatService.currentChatRoom ==
                                                  chatService.rooms[index]
                                              ? Theme.of(context)
                                                  .colorScheme
                                                  .secondary
                                              : Theme.of(context)
                                                  .colorScheme
                                                  .primary),
                                          fontSize: 27,
                                          fontStyle: FontStyle.italic,
                                          decoration: TextDecoration.none,
                                        ),
                                      ),
                                    ),
                                    if (chatService.rooms[index].name !=
                                            "general" &&
                                        chatService.rooms[index].name !=
                                            "game") ...[
                                      SizedBox(
                                        width: 40,
                                        height: 40,
                                        child: FloatingActionButton(
                                          heroTag: null,
                                          onPressed: () {
                                            socketService.socket.emit(
                                                "leaveChatRoom",
                                                chatService.rooms[index].name);
                                            //deletes the room locally since the emit 'leaveChatRoom' does not return anything
                                            chatService.rooms.removeWhere(
                                                (element) =>
                                                    element.name ==
                                                    chatService
                                                        .rooms[index].name);
                                            refresh();
                                          },
                                          backgroundColor:
                                              (chatService.currentChatRoom ==
                                                      chatService.rooms[index]
                                                  ? Theme.of(context)
                                                      .colorScheme
                                                      .secondary
                                                  : Theme.of(context)
                                                      .colorScheme
                                                      .primary),
                                          elevation: 0,
                                          child: Icon(
                                            Icons.logout,
                                            color:
                                                (chatService.currentChatRoom ==
                                                        chatService.rooms[index]
                                                    ? Theme.of(context)
                                                        .colorScheme
                                                        .primary
                                                    : Theme.of(context)
                                                        .colorScheme
                                                        .secondary),
                                            size: 18,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            );
                          },
                          separatorBuilder: (BuildContext context, int index) =>
                              const Divider())),
                )
              ],
            ),
          ),
        ),
        Expanded(
            child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
              border: Border.all(),
              color: Theme.of(context).colorScheme.secondary),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(0, 0, 0, 40),
                child: Container(
                  height: 650,
                  decoration: BoxDecoration(
                      border: Border.all(),
                      color: Theme.of(context).colorScheme.secondary),
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  child: ListView.builder(
                    itemCount: chatService.currentChatRoom.chatHistory.length,
                    shrinkWrap: true,
                    padding: const EdgeInsets.only(top: 10, bottom: 10),
                    controller: _chatScrollController,
                    itemBuilder: (context, index) {
                      return Column(
                        crossAxisAlignment: chatService.currentChatRoom
                                    .chatHistory[index].senderName ==
                                globals.userLoggedIn.username
                            ? CrossAxisAlignment.end
                            : CrossAxisAlignment.start,
                        children: [
                          Padding(
                            padding: const EdgeInsets.fromLTRB(10, 3, 10, 3),
                            child: Text(
                              chatService.currentChatRoom.chatHistory[index]
                                  .senderName,
                              style: TextStyle(
                                color: Theme.of(context).colorScheme.primary,
                              ),
                            ),
                          ),
                          Row(
                            mainAxisAlignment: chatService.currentChatRoom
                                        .chatHistory[index].senderName ==
                                    globals.userLoggedIn.username
                                ? MainAxisAlignment.end
                                : MainAxisAlignment.start,
                            children: [
                              Visibility(
                                visible: chatService.currentChatRoom
                                        .chatHistory[index].senderName ==
                                    globals.userLoggedIn.username,
                                child: Padding(
                                  padding:
                                      const EdgeInsets.fromLTRB(0, 0, 10, 0),
                                  child: Text(
                                    readableTime(chatService.currentChatRoom
                                        .chatHistory[index].timestamp),
                                    style: TextStyle(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      fontSize: 10.0,
                                    ),
                                  ),
                                ),
                              ),
                              Flexible(
                                child: Container(
                                  decoration: BoxDecoration(
                                    color:
                                        Theme.of(context).colorScheme.secondary,
                                    border: Border.all(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      width: 2.0,
                                    ),
                                    borderRadius: const BorderRadius.all(
                                        Radius.circular(5)),
                                  ),
                                  padding: const EdgeInsets.only(
                                      left: 25, right: 25, top: 8, bottom: 8),
                                  child: Text(
                                    chatService
                                        .currentChatRoom.chatHistory[index].msg,
                                    style: TextStyle(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                    ),
                                  ),
                                ),
                              ),
                              Visibility(
                                visible: chatService.currentChatRoom
                                        .chatHistory[index].senderName !=
                                    globals.userLoggedIn.username,
                                child: Padding(
                                  padding:
                                      const EdgeInsets.fromLTRB(10, 0, 0, 0),
                                  child: Text(
                                    readableTime(chatService.currentChatRoom
                                        .chatHistory[index].timestamp),
                                    style: TextStyle(
                                      color:
                                          Theme.of(context).colorScheme.primary,
                                      fontSize: 10.0,
                                    ),
                                  ),
                                ),
                              )
                            ],
                          ),
                        ],
                      );
                    },
                  ),
                ),
              ),
              Align(
                alignment: Alignment.bottomLeft,
                child: Container(
                  decoration: BoxDecoration(
                      border: Border.all(),
                      color: Theme.of(context).colorScheme.secondary),
                  padding: const EdgeInsets.only(left: 10, bottom: 10, top: 10),
                  height: 60,
                  width: double.infinity,
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: TextField(
                          focusNode: _focusNode,
                          controller: msgController,
                          textInputAction: TextInputAction.send,
                          onSubmitted: (value) {
                            sendMessage();
                            _focusNode.requestFocus();
                          },
                          decoration: InputDecoration(
                            fillColor: Theme.of(context).colorScheme.secondary,
                            filled: true,
                            hintText: "Write message...",
                            hintStyle: const TextStyle(color: Colors.black54),
                            border: InputBorder.none,
                          ),
                          onChanged: (String value) {
                            message = value;
                          },
                        ),
                      ),
                      const SizedBox(
                        width: 15,
                      ),
                      FloatingActionButton(
                        heroTag: null,
                        onPressed: () {
                          sendMessage();
                        },
                        backgroundColor: Theme.of(context).colorScheme.primary,
                        elevation: 0,
                        child: Icon(
                          Icons.send,
                          color: Theme.of(context).colorScheme.secondary,
                          size: 18,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        )),
      ],
    );
  }

  Container notificationContainer(Color color) {
    return Container(
        margin: const EdgeInsets.all(5),
        decoration: BoxDecoration(
          color: color,
          borderRadius: BorderRadius.circular(7),
        ),
        constraints: const BoxConstraints(
          minWidth: 10,
          minHeight: 10,
        ),
        child: const SizedBox(
          width: 1,
          height: 1,
        ));
  }

  void sendMessage() {
    if (chatService.currentChatRoom.name == "game") {
      socketService.socket.emit('newMessageClient', message);
    } else {
      socketService.socket.emit(
          'addMsgToChatRoom', [chatService.currentChatRoom.name, message]);
    }
    message = '';
    msgController.clear();
  }

  void _toSearchChatRoomPage() {
    Navigator.push(context,
            MaterialPageRoute(builder: (context) => const SearchPageChatRoom()))
        .then((value) {
      setState(() {});
    });
  }
}

class CreateRoomDialog extends StatefulWidget {
  final Function() notifyParent;

  const CreateRoomDialog({super.key, required this.notifyParent});

  @override
  State<CreateRoomDialog> createState() => _CreateRoomDialog();
}

class _CreateRoomDialog extends State<CreateRoomDialog> {
  final SocketService socketService = SocketService();
  final _formKey = GlobalKey<FormState>();
  late String? name = "";
  late String? password = "";
  bool passwordCheck = false;

  @override
  Widget build(BuildContext context) {
    return TextButton(
      style: TextButton.styleFrom(
        //<-- SEE HERE
        side: BorderSide(
            width: 2.0, color: Theme.of(context).colorScheme.primary),
      ),
      onPressed: () => showDialog<String>(
        context: context,
        builder: (BuildContext context) =>
            StatefulBuilder(builder: (context, setState) {
          return AlertDialog(
            title: const Text('Create a new chatroom'),
            content: const Text('Enter chatroom name'),
            backgroundColor: Theme.of(context).colorScheme.secondary,
            actions: <Widget>[
              Form(
                key: _formKey,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.start,
                  children: [
                    TextFormField(
                      onChanged: (String? value) {
                        name = value;
                      },
                      decoration: InputDecoration(
                        border: const OutlineInputBorder(),
                        labelText: "Name",
                        labelStyle: TextStyle(
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      style: TextStyle(
                          color: Theme.of(context).colorScheme.primary),
                    ),
                    CheckboxListTile(
                      title: const Text("Password"),
                      checkColor: Colors.white,
                      value: passwordCheck,
                      onChanged: (bool? value) {
                        setState(() {
                          passwordCheck = !passwordCheck;
                        });
                      },
                    ),
                    (passwordCheck == true
                        ? TextFormField(
                            onSaved: (String? value) {
                              password = value;
                            },
                            decoration: InputDecoration(
                              border: const OutlineInputBorder(),
                              labelText: "Password",
                              labelStyle: TextStyle(
                                  color: Theme.of(context).colorScheme.primary),
                            ),
                            style: TextStyle(
                                color: Theme.of(context).colorScheme.primary),
                          )
                        : Container()),
                    TextButton(
                      onPressed: () => Navigator.pop(context, 'Cancel'),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () {
                        _onSubmitCreateRoom();
                      },
                      child: const Text('Soumettre'),
                    ),
                  ],
                ),
              )
            ],
          );
        }),
      ),
      child: const Text('Create Room'),
    );
  }

  _onSubmitCreateRoom() {
    print("name");
    print(name);
    if (name == '') {
      return;
    }
    socketService.socket.emit("createChatRoom", name);
    Navigator.pop(context, 'Soumettre');
  }
}
