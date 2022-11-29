import '../services/timer.dart';
import 'package:flutter/cupertino.dart';
import 'dart:developer';

class RankedService{
  TimerService timerService = TimerService();
  bool isShowModal = false;
  late bool matchAccepted = false;



  matchHasBeenFound() {
    matchAccepted = false;
    const timerTime = 0.25;
    isShowModal = true;
    timerService.startTimer(timerTime);
  }

  closeModal() {
    isShowModal = false;
    timerService.secondsValue = 0;
    timerService.clearTimer();
  }
}
