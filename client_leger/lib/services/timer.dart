import 'dart:async';

import 'package:flutter/cupertino.dart';

class TimerService with ChangeNotifier{
  String displayTimer = '';
  num secondsValue = 0;
  num playingTime = 0;
  late Timer timerInterval = Timer(const Duration(milliseconds: 1), () {});

  static final TimerService _timerService = TimerService._internal();

  factory TimerService() {
    return _timerService;
  }

  TimerService._internal();

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
      playingTime++;

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

  clearTimer() {
    timerInterval.cancel();
  }
}
