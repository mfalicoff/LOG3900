import 'package:client_leger/utils.dart';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

import 'env/environment.dart';
import 'models/chat.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key});

  // This widget is the home page of your application. It is stateful, meaning
  // that it has a State object (defined below) that contains fields that affect
  // how it looks.

  // This class is the configuration for the state. It holds the values (in this
  // case the title) provided by the parent (in this case the App widget) and
  // used by the build method of the State. Fields in a Widget subclass are
  // always marked "final".

  @override
  State<ChatPage> createState() => _MyChatPageState();
}

class _MyChatPageState extends State<ChatPage> {
  String message = "";
  late List<ChatMessage> chatHistory = [];

  late IO.Socket socket;

  var msgController = TextEditingController();

  FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    socket = IO.io(
        Environment().config?.serverURL,
        OptionBuilder().setTransports(['websocket']) // for Flutter or Dart VM
            .setExtraHeaders({'foo': 'bar'}) // optional
            .build());

    initSockets();
    super.initState();
  }

  void initSockets() {
    socket.on('chat msg', (data) {
      if (mounted) {
        setState(() {
          chatHistory.add(ChatMessage(
              msg: data['msg'],
              sender: data['sender'],
              timestamp: data['timestamp']));
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
        body: (Stack(
      children: <Widget>[
        Container(
          decoration: const BoxDecoration(
            image: DecorationImage(
              image: AssetImage("assets/background.jpg"),
              fit: BoxFit.cover,
            ),
          ),
        ),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 10),
          child: ListView.builder(
            itemCount: chatHistory.length,
            shrinkWrap: true,
            padding: const EdgeInsets.only(top: 10, bottom: 10),
            physics: const NeverScrollableScrollPhysics(),
            itemBuilder: (context, index) {
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(10, 3, 0, 3),
                    child: Text(
                      chatHistory[index].sender,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                  Row(
                    children: [
                      Flexible(
                        child: Container(
                          decoration: BoxDecoration(
                            color: Theme.of(context).colorScheme.secondary,
                            border: Border.all(
                              color: Theme.of(context).colorScheme.primary,
                              width: 2.0,
                            ),
                            borderRadius:
                                const BorderRadius.all(Radius.circular(18)),
                          ),
                          padding: const EdgeInsets.only(
                              left: 25, right: 25, top: 8, bottom: 8),
                          child: Text(
                            chatHistory[index].msg,
                            style: TextStyle(
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.fromLTRB(10, 0, 0, 0),
                        child: Text(
                          chatHistory[index].timestamp.toString(),
                          style: TextStyle(
                            color: Theme.of(context).colorScheme.primary,
                            fontSize: 10.0,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              );
            },
          ),
        ),
        Align(
          alignment: Alignment.bottomLeft,
          child: Container(
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
                        border: InputBorder.none,),
                    onChanged: (String value) {
                      message = value;
                    },
                  ),
                ),
                const SizedBox(
                  width: 15,
                ),
                FloatingActionButton(
                  onPressed: () => {sendMessage()},
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
    )));
  }

  void initPage() {
    initState();
  }

  void sendMessage() {
    if (!isMessageEmpty()) {
      ChatMessage chat = ChatMessage(
          msg: message, sender: "test", timestamp: DateTime.now().millisecondsSinceEpoch);
      setState(() {
        chatHistory.add(chat);
        message = "";
      });
      socket.emit("chat msg", chat);
    }
    message = "";
    msgController.clear();
  }

  bool isMessageEmpty() {
    return message.isEmpty || message.trim() == '';
  }
}
