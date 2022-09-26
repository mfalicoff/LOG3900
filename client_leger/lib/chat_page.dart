
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';

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

  @override
  void initState() {
    socket = IO.io('http://10.0.2.2:3000',
        OptionBuilder()
            .setTransports(['websocket']) // for Flutter or Dart VM
            .setExtraHeaders({'foo': 'bar'}) // optional
            .build());

    initSockets();
    super.initState();
  }

  void initSockets() {
      socket.on('chat msg', (data) {
        if(mounted){
          setState(() {
            chatHistory.add(ChatMessage(msg: data['msg'], id: data['id']));
          });
        }
      });
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(
            body:(
                Stack(
                  children: <Widget>[
                    Container(
                      decoration: const BoxDecoration(
                        image: DecorationImage(image: AssetImage("assets/background.jpg"), fit: BoxFit.cover,),
                      ),
                    ),
                    Positioned(
                        top: 10.0,
                        right: 30.0,
                        child: ElevatedButton(
                            style: ButtonStyle(
                                padding: MaterialStateProperty.all(
                                  const EdgeInsets.symmetric(vertical: 18.0, horizontal: 0.0),
                                ),
                                shape: MaterialStateProperty.all<RoundedRectangleBorder>(
                                    RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(100.0)
                                    )
                                )
                            ),
                            onPressed: _toChatPage,
                            child: const Icon(Icons.chat))
                    ),
                    Container(
                      color: Colors.white,
                      child:
                      ListView.builder(
                        itemCount: chatHistory.length,
                        shrinkWrap: true,
                        padding: EdgeInsets.only(top: 10,bottom: 10),
                        physics: NeverScrollableScrollPhysics(),
                        itemBuilder: (context, index){
                          return Container(
                            padding: EdgeInsets.only(left: 16,right: 16,top: 10,bottom: 10),
                            child: Text(chatHistory[index].msg),
                          );
                        },
                      ),
                    ),

                    Align(
                      alignment: Alignment.bottomLeft,
                      child: Container(
                        padding: const EdgeInsets.only(left: 10,bottom: 10,top: 10),
                        height: 60,
                        width: double.infinity,
                        color: Colors.white,
                        child: Row(
                          children: <Widget>[
                            GestureDetector(
                              onTap: (){
                              },
                              child: Container(
                                height: 30,
                                width: 30,
                                decoration: BoxDecoration(
                                  color: Colors.lightBlue,
                                  borderRadius: BorderRadius.circular(30),
                                ),
                                child: Icon(Icons.add, color: Colors.white, size: 20, ),
                              ),
                            ),
                            SizedBox(width: 15,),
                            Expanded(
                              child: TextField(
                                decoration: InputDecoration(
                                    hintText: "Write message...",
                                    hintStyle: TextStyle(color: Colors.black54),
                                    border: InputBorder.none
                                ),
                                onChanged: (String value) {
                                  print(value);
                                  message = value;
                                },
                              ),
                            ),
                            const SizedBox(width: 15,),
                            FloatingActionButton(
                              onPressed: () => {sendMessage()},
                              backgroundColor: Colors.blue,
                              elevation: 0,
                              child: const Icon(Icons.send,color: Colors.white,size: 18,),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                )
            )
        );
  }

  void _toChatPage() {
    Navigator.of(context).push(
        MaterialPageRoute(
            builder: (context) => const Text("Chat page")
        )
    );
  }

  void initPage(){
    initState();
  }

  void sendMessage() {
    print(message);
    ChatMessage chat = ChatMessage(msg: message, id: "test");
    setState(() {
      chatHistory.add(chat);
      message = "";
    });
    print(chatHistory);
    socket.emit("chat msg", chat);
  }
}
