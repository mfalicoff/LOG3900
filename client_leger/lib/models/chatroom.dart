import 'package:flutter/cupertino.dart';

import 'chat.dart';

class ChatRoom{
  late String name;
  late List<String> participants;
  List<ChatMessage> chatHistory = [];
  late bool isUnread = false;

  ChatRoom({required this.name, required this.participants});

  ChatRoom.fromJson(Map json){
    name = json['name'];
    participants = json['participants'].map<String>((e)=>e.toString()).toList();
    chatHistory = [];
    for(var message in json['chatHistory']){
      chatHistory.add(ChatMessage.fromJson(message));
    }
  }
}
