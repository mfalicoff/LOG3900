
class ChatMessage{
  late String msg;
  late String id;
  ChatMessage({required this.msg, required this.id});

  Map<String, dynamic> toJson(){
    return {
      'id': id,
      'msg': msg,
    };
  }

  ChatMessage.fromJson(Map json)
      : id = json['id'],
        msg = json['msg'];
}
