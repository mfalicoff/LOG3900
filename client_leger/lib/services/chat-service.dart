import 'package:client_leger/models/tile.dart';
import 'package:flutter/material.dart';

import '../models/chatroom.dart';

class ChatService with ChangeNotifier{
  static final ChatService _chatService = ChatService._internal();

  List<ChatRoom> rooms = [];
  ChatRoom currentChatRoom = ChatRoom(name: "bugIfHere", participants: []);
  //chatRoom tmp for the search of rooms
  ChatRoom? chatRoomWanted;

  factory ChatService(){
    return _chatService;
  }

  ChatService._internal() {}
}
