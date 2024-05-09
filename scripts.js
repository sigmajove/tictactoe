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

// Returns true if the game is over.
function checkGameOver() {
    let winner = " ";
    checkRows((x, y, z) => {
        let bx = board[x];
        let by = board[y];
        let bz = board[z];
        if (bx == by && by == bz && bx != " ") {
            winner = bx;
        }
    });
    if (winner != " ") {
        message.innerHTML = `<h3>${winner} wins ${restartHTML}</h3>`;
        return true;
    }

    // See if there are any empty squares left.
    if (board.reduce((accum, current) =>
            current == " " ? true : accum, false)) {
        return false;
    }

    // The game ended in a draw.
    message.innerHTML = `<h3>Tie game ${restartHTML}</h3>`;
    return true;
}

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
    rotate3 = () => {
        for (let i = 0; i < 3; ++i) {
            func(b);
            b = rotate(b);
        };
    }
    rotate3();
    func(b);
    b = mirror(b);
    rotate3();
    func(b);
}

// The strategy tables.
let goodMoves = new Map();
let badMoves = new Map();

// Adds the moves dictated by an one of the strategy patterns.
function addMoves(board, table) {
    let moves = [];
    let boardArr = board.split('');

    boardArr.forEach((s, i, a) => {
        if (s == '$') {
            moves.push(i);
            a[i] = ' ';
        }
    });
    table.set(boardArr.join(''), moves);
}

{
    // Each string represents the nine squares 012345678
    // Each $ represents an acceptable next move.
    // Each good move has eight reflections and rotations.
    // If a board position is not listed, then any move is acceptable.
    /* beautify preserve:start */
    const patterns = [
        "X   $    ", "X   $O X ", "X  $$X$ O", "X $   $ O", "X $ $O$  ",
        "X $ X $ O", "X O    X$", "X O$  $ $", "X O$ X  O", "X O$$X   ",
        "X O$$X O ", "X O$$X XO", "X$ $O$ $X", "X$$ OX $$", "X$$ OX$$O",
        "XO    $X$", "XO   O$X$", "XO  $X   ", "XO  $XO $", "XO  $XOX$",
        "XO  O $X ", "XO  OX$X$", "XO $ X  O", "XO $$ $  ", "XO $$X$XO",
        "XO $X $ O", "XO O X  $", "XO O X X$", "XO OOX X$", "XO X$ O  ",
        "XO X$$OX$", "XOO$ $$X$", "XOO$ X XO", "XOO$$X$$ ", "XOOO X X$",
        "XOX   O $", "XOX $    ", "XOX $$OX$", "XOXO  OX$", "XOXO$   $",
        "XOXO$  X$", "XOXX  O$ ", "XXO   $O$", "XXO  $  $", "XXO  X$ O",
        "XXO  X$O ", "OX   X$  ", "OX $$ $ $", "OX $$X$O$", "OX $X$$O$",
        "OX X$$ $ ", "OX$X$O $$", "OXOX$    ", " X OXX$O ", " X$O X  $",
        " X$O X O ", " X$OOX   ", "$ $ X $ $", "$O$$X$$ $", "$X    O  ",
        "$X   XO $", "$X O$    ", "$X OOX$X ", "$X$ $  $ ", "$X$ X $O$",
        "$X$$O$$ $", "$X$OX  O ", "$X$XO $  " ];
    /* beautify preserve:end */
    patterns.forEach((p) => symmetry((b) => addMoves(b, goodMoves), p));
}

{
    // These patterns have the same syntax, but represent opportunities
    // for the program to let the Wookiee win.
    /* beautify preserve:start */
    const patterns = [
        '$$$$$$$$$', 'X$$$$$$$$', '$X$$$$$$$', '$$$$X$$$$', 'XO$$ $   ',
        'X$O  $$  ', 'X  $ O $ ', 'X$$$ $$$O', 'OX$$ $$ $', 'O$   X  $',
        '$X O$$$$$', ' X $O$ $ ', '$X$$$$ O ', ' O $X$ $ ', 'XXO$     ',
        'XOX$ $$ $', 'XO$$$X$ $', 'XO$$$$$X$', 'X$O$ X $$', 'X$O$   X$',
        'X$ $X   O', 'X$ $OX   ', 'X $$ X O$', 'X$$$ X$$O', 'OX$X $$$ ',
        'OX$$ X $ ', ' X XO$ $ ', '$X$X$O$$ ', ' X $X$ O ', 'XXOO  $  ',
        'XXO  $ O ', 'XOX$  O  ', 'XO$  X  O', 'X$O  X O ', 'X$O  X  O',
        'OXOX  $  ', 'OX X O$  ', ' X XOO $ ', ' X X$O O ', ' X OX$ O ',
        'XOXO  $X ', 'XOX$  OX ', 'XOO$ X X$', 'XO$O$X$X ', 'XO $OX X ',
        'XO $ XOX ', 'XO$  X XO', 'X$O  X XO',
    ];
    /* beautify preserve:end */
    patterns.forEach((p) => symmetry((b) => addMoves(b, badMoves), p));
}

// If a row contains two whos in a row and a space, returns
// the index of the space. Returns every such index, may be empty.
function checkTwoInARow(board, who) {
    let moves = []
    checkRows((x, y, z) => {
        let bx = board[x];
        let by = board[y];
        let bz = board[z];
        if (bx == " " && by == who && bz == who) {
            moves.push(x);
        } else if (by == " " && bx == who && bz == who) {
            moves.push(y);
        } else if (bz == " " && bx == who && by == who) {
            moves.push(z);
        }
    });
    return moves;
}

// Returns the number of Xs and Os on the board.
function numberFilled(board) {
    return board.reduce((accum, current) =>
        current == " " ? accum : accum + 1, 0);
}

// Returns all the possible computer moves from this position.
// beatable indicates which table to use. 
// if we can't find a move using badMoves and fallback is set,
// then we also try goodMoves.
function getComputerMoves(board, beatable, fallback) {
    if (numberFilled(board) % 2 == 0) {
        var me = 'X';
        var him = 'O';
    } else {
        var me = 'O';
        var him = 'X';
    }

    // See if the computer can win right now.
    let moves = checkTwoInARow(board, me);
    let debug = "win";

    // If not, see if it needs to block.
    if (moves.length == 0) {
        moves = checkTwoInARow(board, him);
        debug = "block"
    }

    // If not, see if the board is the strategy table(s).
    if (moves.length == 0) {
        let lookupKey = board.join('');
        if (beatable) {
            moves = badMoves.get(lookupKey);
            debug = "bad table";
            if (moves === undefined && fallback) {
                moves = goodMoves.get(lookupKey);
                debug = "good table";
            }
        } else {
            moves = goodMoves.get(lookupKey);
            debug = "good table";
        }
    }
    /* const fff = (m)=>`${m}`;
    console.log(`${debug}: ${moves.map(fff).join(", ")}`); */
    return moves;
}

function emptySquares(board) {
    moves = [];
    board.forEach((s, i) => {
        if (s == ' ') {
            moves.push(i);
        }
    });
    return moves;
}

// Returns a random element of an array, or null if the array is empty.
function randomElement(arr) {
    return arr.length == 0 ? undefined :
        arr[Math.floor(Math.random() * arr.length)];
}

function MakeComputerMove() {
    moves = getComputerMoves(board, beatable, /*fallback=*/ true);

    // If the algorithm couldn't find a move, choose one at random.
    if (moves === undefined) {
        moves = emptySquares(board);
    }
    let m = randomElement(moves);
    if (m !== undefined) {
        // Write the computer move in both the board and the DOM.
        board[m] = computerXO;
        cells[m].innerHTML = computerXO == "X" ? xSquare : oSquare;

        // Flash the computer move, and proceed when the animation is over. 
        blinkSquare(m).then((x) => {
            if (checkGameOver()) {
                gameOver = true;
                window.onbeforeunload = undefined;
            }
        });
    }
}

// Invoked when the user clicks on a square.
function clickSquare(id) {
    if (working || gameOver || board[id] != " ") {
        return;
    }

    // Write the human's move in both the board and the DOM.
    board[id] = humanXO;
    cells[id].innerHTML = humanXO == "X" ? xSquare : oSquare;

    if (checkGameOver()) {
        gameOver = true;
        window.onbeforeunload = undefined;
        return;
    }

    MakeComputerMove();
}

// Make functions visible to to the tests, which run under node.js.
if (typeof exports != "undefined") {
    exports.getComputerMoves = getComputerMoves;
    exports.emptySquares = emptySquares;
    exports.checkRows = checkRows;
    exports.randomElement = randomElement;
}
