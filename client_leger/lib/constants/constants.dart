const Map<String, int> colorTilesMap = {
  "xx": 0xFFBEB9a6,
  "wordx3": 0xFFF75D59,
  "wordx2": 0xFFFBBBB9,
  "letterx3": 0xFF157DEC,
  "letterx2": 0xFFA0CFEC,
};

const Map<String, String> textTilesMap = {
  "xx": "",
  "wordx3": "MOT\nx3",
  "wordx2": "MOT\nx2",
  "letterx3": "LETTRE\nx3",
  "letterx2": "LETTRE\nx2",
};

const Map<int, String> indexToLetter = {
  1 : "A",
  2 : "B",
  3 : "C",
  4 : "D",
  5 : "E",
  6 : "F",
  7 : "G",
  8 : "H",
  9 : "I",
  10 : "J",
  11 : "K",
  12 : "L",
  13 : "M",
  14 : "N",
  15 : "O",
};

const double WIDTH_HEIGHT_BOARD = 750;

const double WIDTH_PLAY_AREA = 900;

const double PADDING_BET_BOARD_AND_STAND = 5;
const double SIZE_OUTER_BORDER_BOARD = 40;

const double NB_SQUARE_H_AND_W = 15;
const double WIDTH_LINE_BLOCKS = 4;
const double WIDTH_BOARD_NOBORDER = WIDTH_HEIGHT_BOARD - SIZE_OUTER_BORDER_BOARD * 2;
const double WIDTH_EACH_SQUARE =
    (WIDTH_HEIGHT_BOARD - SIZE_OUTER_BORDER_BOARD * 2 - (NB_SQUARE_H_AND_W - 1) * WIDTH_LINE_BLOCKS) / NB_SQUARE_H_AND_W;

const double NUMBER_SLOT_STAND = 7;
const double SIZE_OUTER_BORDER_STAND = 6;
const double WIDTH_STAND = WIDTH_EACH_SQUARE * NUMBER_SLOT_STAND + WIDTH_LINE_BLOCKS * (NUMBER_SLOT_STAND - 1) + SIZE_OUTER_BORDER_STAND * 2;
const double HEIGHT_STAND = WIDTH_EACH_SQUARE + SIZE_OUTER_BORDER_STAND * 2;

const double PADDING_BOARD_FOR_STANDS = HEIGHT_STAND + PADDING_BET_BOARD_AND_STAND;

//CONSTANTS FOR
