class ChatMessage{
  late String msg;
  late String sender;
  late int timestamp;

  ChatMessage({required this.msg, required this.sender, required this.timestamp});

  Map<String, dynamic> toJson(){
    return {
      'sender': sender,
      'msg': msg,
      'timestamp': timestamp,
    };
  }

  ChatMessage.fromJson(Map json)
      : sender = json['sender'],
        msg = json['msg'],
        timestamp = json['timestamp'];
}
