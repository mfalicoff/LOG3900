import '../services/timer.dart';
import 'package:flutter/cupertino.dart';
import 'dart:developer';

class RankedService{
  TimerService timerService = TimerService();
  bool isShowModal = false;


  matchHasBeenFound() {
    const timerTime = 0.25;
    isShowModal = true;
    timerService.startTimer(timerTime);
  }

  closeModal() {
    timerService.clearTimer();
    isShowModal = false;
  }
}
