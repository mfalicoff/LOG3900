import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:socket_io_client/socket_io_client.dart';
import '../env/environment.dart';


class SocketService {
  static final SocketService _socketService = SocketService._internal();

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
  }
}
