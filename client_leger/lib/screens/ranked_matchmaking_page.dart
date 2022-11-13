import 'package:flutter/material.dart';
import 'dart:ui';
import 'dart:developer';
import '../services/timer.dart';
import 'package:client_leger/utils/globals.dart' as globals;
import 'package:client_leger/services/socket_service.dart';
import 'package:client_leger/services/ranked.dart';

class RankedMatchmakingPage extends StatefulWidget {
  const RankedMatchmakingPage({Key? key}) : super(key: key);

  @override
  State<RankedMatchmakingPage> createState() => _RankedMatchmakingPageState();
}

class _RankedMatchmakingPageState extends State<RankedMatchmakingPage> {
  final TimerService timerService = TimerService();
  final SocketService socketService = SocketService();
  final RankedService rankedService = RankedService();
  late bool matchAccepted = false;

  @override
  void initState() {
    timerService.clearTimer();
    timerService.clearMatchmakingTimer();
    timerService.startMatchmakingTimer();
    timerService.addListener(refresh);
    super.initState();
  }

  void refresh() {
    if (mounted) {
      setState(() {});
    }
  }

  Widget build(BuildContext context) {
    return Scaffold(
      resizeToAvoidBottomInset: false,
      body: Stack(
        children: [
          Container(
            decoration: const BoxDecoration(
              image: DecorationImage(
                image: AssetImage("assets/background.jpg"),
                fit: BoxFit.cover,
              ),
            ),
            padding:
                const EdgeInsets.symmetric(vertical: 100.0, horizontal: 200.0),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
              child: Container(
                decoration: BoxDecoration(
                    shape: BoxShape.rectangle,
                    color: Theme.of(context).colorScheme.secondary,
                    borderRadius: const BorderRadius.all(Radius.circular(20.0)),
                    border: Border.all(
                        color: Theme.of(context).colorScheme.primary,
                        width: 3)),
                padding: const EdgeInsets.symmetric(
                    vertical: 25.0, horizontal: 250.0),
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text (
                        "Matchmaking en cours",
                        style: TextStyle(
                            fontSize: 35,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      Text(
                        timerService.matchmakingDisplayTimer,
                        style: TextStyle(
                            fontSize: 35,
                            color: Theme.of(context).colorScheme.primary),
                      ),
                      CircularProgressIndicator(
                      ),
                    ],
                  ),

                ),


              ),


            ),
          ),
          timerService.secondsValue!=0?
            AlertDialog(
                title:
                Center(child: Text('Partie trouvée')),
                actions: [
                  Center(child: Text(
                    timerService.displayTimer,
                    style: TextStyle(
                        fontSize: 35,
                        color: Theme
                            .of(context)
                            .colorScheme
                            .primary),
                  )),
                  Center(
                    child: Row(
                        mainAxisAlignment: MainAxisAlignment
                            .spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment
                            .center,
                        children: [

                          TextButton(
                              child: Text('Accepter'),
                              onPressed: () => acceptMatch()
                          ),
                          TextButton(
                              child: Text('Refuser'),
                              onPressed: () => refuseMatch()
                          ),
                        ]
                    ),
                  ),
                ]
            )
              :Container(),
        ],
      ),

    );
  }


  showAlertDialog(BuildContext context) {
    // set up the buttons
    Widget cancelButton = TextButton(
      child: Text("Annuler"),
      onPressed: () {
        Navigator.of(context).pop();
      },
    );
  }

  Future<void> MatchFound(BuildContext context) async {
    return showDialog(
        context: context,
        builder: (context) =>
            AlertDialog(
                title:
                Center(child: Text('Partie trouvée')),
                actions: [
                  Center(child:Text(
                    timerService.displayTimer,
                    style: TextStyle(
                        fontSize: 35,
                        color: Theme
                            .of(context)
                            .colorScheme
                            .primary),
                  )),
                  Center(
                    child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [

                          TextButton(
                              child: Text('Accepter'),
                              onPressed: () => acceptMatch()
                          ),
                          TextButton(
                              child: Text('Refuser'),
                              onPressed: () => refuseMatch()
                          ),
                        ]
                    ),
                  ),
                ]
            )

    );
  }

  acceptMatch() {
    matchAccepted = true;
    socketService.socket.emit("acceptMatch",globals.userLoggedIn);
  }
  refuseMatch() {
    socketService.socket.emit("refuseMatch",globals.userLoggedIn);
    Navigator.pushNamed(
        context, "/ranked-init");
  }


}
