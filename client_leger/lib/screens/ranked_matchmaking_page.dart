import 'package:flutter/material.dart';
import 'dart:ui';
import '../services/timer.dart';

class RankedMatchmakingPage extends StatefulWidget {
  const RankedMatchmakingPage({Key? key}) : super(key: key);

  @override
  State<RankedMatchmakingPage> createState() => _RankedMatchmakingPageState();
}

class _RankedMatchmakingPageState extends State<RankedMatchmakingPage> {
  final TimerService timerService = TimerService();
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
                        timerService.matchmakingSecondsValue.toString(),
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
        ],
      ),
    );
  }
  acceptMatch() {

  }
  refuseMatch() {

  }
}
