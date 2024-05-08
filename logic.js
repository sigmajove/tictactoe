// The strategy tables.
let goodMoves = new Map();
let badMoves = new Map();

// Rotates a board string 90 degrees counterclockwise.
function rotate(b) {
  return `${b[2]}${b[5]}${b[8]}${b[1]}${b[4]}${b[7]}${b[0]}${b[3]}${b[6]}`;
}

// Returns the mirror image of a board string.
function mirror(b) {
  return `${b[2]}${b[1]}${b[0]}${b[5]}${b[4]}${b[3]}${b[8]}${b[7]}${b[6]}`;
}

// Calls func on the eight symmetric variations on board.
function symmetry(func, board) {
  let b = board;
  let rotate3 = () => {
    for (let i = 0; i < 3; ++i) {
      func(b);
      b = rotate(b);
    };
  };
  rotate3();
  func(b);
  b = mirror(b);
  rotate3();
  func(b);
}

/*
function normalize(b) {
    let result = null;
    symmetry((board) => {
        if (result === null || board < result) {
            result = board;
        }
    }, b);
    return result;
};
*/


// Adds the moves dictated by an one of the strategy patterns.
function addMoves(board, table) {
  let moves = [];
  let boardArr = board.split('');

  for (let i = 0; i < boardArr.length; ++i) {
    if (boardArr[i] == '$') {
      moves.push(i);
      boardArr[i] = ' ';
    }
  }
  table.set(boardArr.join(''), moves);
}

{
  // Each string represents the nine squares 012345678
  // Each $ represents an acceptable next move.
  // Each good move has eight reflections and rotations.
  // If a board position is not listed, then any move is acceptable.
  const patterns = [
    'X   $    ', 'X   $O X ', 'X  $$X$ O', 'X $   $ O', 'X $ $O$  ',
    'X $ X $ O', 'X O    X$', 'X O$  $ $', 'X O$ X  O', 'X O$$X   ',
    'X O$$X O ', 'X O$$X XO', 'X$ $O$ $X', 'X$$ OX $$', 'X$$ OX$$O',
    'XO    $X$', 'XO   O$X$', 'XO  $X   ', 'XO  $XO $', 'XO  $XOX$',
    'XO  O $X ', 'XO  OX$X$', 'XO $ X  O', 'XO $$ $  ', 'XO $$X$XO',
    'XO $X $ O', 'XO O X  $', 'XO O X X$', 'XO OOX X$', 'XO X$ O  ',
    'XO X$$OX$', 'XOO$ $$X$', 'XOO$ X XO', 'XOO$$X$$ ', 'XOOO X X$',
    'XOX   O $', 'XOX $    ', 'XOX $$OX$', 'XOXO  OX$', 'XOXO$   $',
    'XOXO$  X$', 'XOXX  O$ ', 'XXO   $O$', 'XXO  $  $', 'XXO  X$ O',
    'XXO  X$O ', 'OX   X$  ', 'OX $$ $ $', 'OX $$X$O$', 'OX $X$$O$',
    'OX X$$ $ ', 'OX$X$O $$', 'OXOX$    ', ' X OXX$O ', ' X$O X  $',
    ' X$O X O ', ' X$OOX   ', '$ $ X $ $', '$O$$X$$ $', '$X    O  ',
    '$X   XO $', '$X O$    ', '$X OOX$X ', '$X$ $  $ ', '$X$ X $O$',
    '$X$$O$$ $', '$X$OX  O ', '$X$XO $  '
  ];
  patterns.forEach((p) => symmetry((b) => addMoves(b, goodMoves), p));
}

{
  // These patterns have the same syntax, but represent opportunities
  // for the program to let the Wookiee win.
  const patterns = [
    ' O  X  $ ', ' X $$$ O ', ' X $O$$$$', ' X $X$ O ', ' X O $$ $',
    ' X OX$ O ', ' X X$O O ', ' X XO$ $$', ' X XOO $ ', '$$$$$$$$$',
    '$$$$X$$$$', '$X X$O$$ ', '$X$$$$$$$', 'O   $X X$', 'O$   X$$ ',
    'OX X O$  ', 'OX$  X $$', 'OX$  X O ', 'OX$ X  O ', 'OX$$ $$ $',
    'OX$X $$$$', 'OXOX $$$ ', 'X    $ $O', 'X    O $ ', 'X   O$ $ ',
    'X  $OX  O', 'X  $OX$  ', 'X $ O $ X', 'X $$ X$O ', 'X$ $X$ $O',
    'X$$$ X  O', 'X$$$$$$$$', 'X$O  $ $ ', 'X$O  X  O', 'X$O  X O$',
    'X$O  X$XO', 'X$O$ X$$$', 'X$O$$$$X ', 'XO $ XO  ', 'XO$  $   ',
    'XO$  X  O', 'XO$  X XO', 'XO$$ X$ $', 'XO$$ XOX ', 'XO$$$$$X$',
    'XO$$OX X ', 'XO$O$X$X ', 'XOO  X  $', 'XOO$$X$X$', 'XOX$  O  ',
    'XOX$  OX ', 'XOX$ $$ $', 'XOXO  $  ', 'XOXO $$X ', 'XXO$  $  ',
    'XXO$$$ O ', 'XXOO  $$$', 'XXOO X$  '
  ];
  patterns.forEach((p) => symmetry((b) => addMoves(b, badMoves), p));
}

// Calls func on horizontal, vertical, and diagonal rows.
function checkRows(func) {
  func(0, 1, 2);
  func(3, 4, 5);
  func(6, 7, 8);
  func(0, 3, 6);
  func(1, 4, 7);
  func(2, 5, 8);
  func(0, 4, 8);
  func(2, 4, 6);
}
exports.checkRows = checkRows;

// If a row contains two whos in a row and a space, returns
// the index of the space. Returns every such index, may be empty.
function checkTwoInARow(board, who) {
  let moves = []
  checkRows((x, y, z) => {
    let bx = board[x];
    let by = board[y];
    let bz = board[z];
    if (bx == ' ' && by == who && bz == who) {
      moves.push(x);
    } else if (by == ' ' && bx == who && bz == who) {
      moves.push(y);
    } else if (bz == ' ' && bx == who && by == who) {
      moves.push(z);
    }
  });
  return moves;
}
exports.checkTwoInARow = checkTwoInARow;

// Returns all the possible good computer moves from this position.
function getOptimalMoves(board) {
  let count = 0;
  board.forEach((p) => {
    if (p != ' ') {
      ++count
    };
  });
  if (count % 2 == 0) {
    var me = 'X';
    var him = 'O';
  } else {
    var me = 'O';
    var him = 'X';
  }

  // See if I can win right now.
  let moves = checkTwoInARow(board, me);

  // If not, see if it needs to block.
  if (moves.length == 0) {
    moves = checkTwoInARow(board, him);
  }

  // If not, see if the board is in GoodMoves.
  if (moves.length == 0) {
    moves = goodMoves.get(board.join(''));
  }

  // If not, just pick any empty square.
  if (moves === undefined) {
    moves = [];
    for (let i = 0; i < 9; ++i) {
      if (board[i] == ' ') {
        moves.push(i);
      }
    }
  }
  return moves;
}
exports.getOptimalMoves = getOptimalMoves;

var used_moves = new Set();

// Returns all the possible throw  moves from this position.
function getThrowMoves(board) {
  let count = 0;
  board.forEach((p) => {
    if (p != ' ') {
      ++count
    };
  });
  if (count % 2 == 0) {
    var me = 'X';
    var him = 'O';
  } else {
    var me = 'O';
    var him = 'X';
  }

  // See if I can win right now.
  let moves = checkTwoInARow(board, me);

  // If not, see if it needs to block.
  if (moves.length == 0) {
    moves = checkTwoInARow(board, him);
  }

  // If not, see if the board is in BadMoves.
  if (moves.length == 0) {
    moves = badMoves.get(board.join(''));
    if (moves !== undefined) {
      used_moves.add(board.join(''));
    }
  }

  return moves;
}
exports.getThrowMoves = getThrowMoves;

function report(printBoard) {
    badMoves.forEach((val, key, map) => {
        if (!used_moves.has(key)) {
            console.log("Wasn't used");
            printBoard(key);
        }
    });
    used_moves.forEach((val) => {
        if (!badMoves.has(val)) {
            console.log("Wasn't defined");
            printBoard(val);
        }
    });
}
exports.report = report;

function getOptimalMove(board) {
  const moves = getOptimalMoves(board);

  // Return one of the moves at random, or null if there is none.
  // There should always be one.
  return moves.length == 0 ? null :
                             moves[Math.floor(Math.random() * moves.length)];
}
exports.getOptimalMove = getOptimalMove;
