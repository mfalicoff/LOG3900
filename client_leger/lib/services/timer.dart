import 'dart:async';
import 'dart:developer';
import 'package:flutter/cupertino.dart';

class TimerService with ChangeNotifier{
  String displayTimer = '';
  String matchmakingDisplayTimer = '';
  num matchmakingSecondsValue = 0;
  num secondsValue = 0;
  num playingTime = 0;
  late Timer matchmakingTimerInterval = Timer(const Duration(milliseconds: 1), () {});
  late Timer timerInterval = Timer(const Duration(milliseconds: 1), () {});
  late Timer timerGame = Timer(const Duration(milliseconds: 1), () {});

  static final TimerService _timerService = TimerService._internal();

  factory TimerService() {
    return _timerService;
  }

  TimerService._internal();

  startMatchmakingTimer() {
    num secondsInMinute = 60;

    num displayZero = 9;
    int oneSecond = 1000;
    matchmakingTimerInterval = Timer.periodic(Duration(milliseconds: oneSecond),(timer) {
      matchmakingSecondsValue++;
      if (matchmakingSecondsValue % secondsInMinute <= displayZero) {
          matchmakingDisplayTimer =
              'Temps écoulé : ${(matchmakingSecondsValue / secondsInMinute).floor()}:0${matchmakingSecondsValue % secondsInMinute}';
        } else {
          matchmakingDisplayTimer =
              'Temps écoulé : ${(matchmakingSecondsValue / secondsInMinute).floor()}:${matchmakingSecondsValue % secondsInMinute}';
        }
        notifyListeners();
    });
  }

  startTimer(num minutesByTurn) {
    if (minutesByTurn < 0) {
      return;
    }

    num secondsInMinute = 60;
    secondsValue = minutesByTurn * secondsInMinute;

    num displayZero = 9;
    int oneSecond = 1000;

    timerInterval = Timer.periodic(Duration(milliseconds: oneSecond), (timer) {
      secondsValue--;

      if (secondsValue >= 0) {
        if (secondsValue % secondsInMinute <= displayZero) {
          displayTimer =
              'Temps Restant : ${(secondsValue / secondsInMinute).floor()}:0${secondsValue % secondsInMinute}';
        } else {
          displayTimer =
              'Temps Restant : ${(secondsValue / secondsInMinute).floor()}:${secondsValue % secondsInMinute}';
        }
      }
      notifyListeners();
    });
  }
  startGameTimer() {
    int oneSecond = 1000;
    playingTime = 0.0;
    timerGame = Timer.periodic(Duration(milliseconds: oneSecond), (timer) {
        playingTime++;
    });
 }

  addSecsToTimer(num secsToAdd){
    secondsValue += secsToAdd;
  }

  clearGameTimer() {
    timerGame.cancel();
  }

  clearTimer() {
    timerInterval.cancel();
    secondsValue = 0;
  }

  clearMatchmakingTimer() {
    matchmakingSecondsValue = 0;
    matchmakingTimerInterval.cancel();
  }
}
