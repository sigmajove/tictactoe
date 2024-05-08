function squareButton(i) { return `<button onclick="clickSquare(${i})"
style="display:block; background: transparent; border: none !important;
font-size:0; height:50px; width:50px;">
</button>`;
}

const svgHdr =
    `<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">` 

// Use Scalable Vector Graphics to an X on the board.
const xSquare = `${svgHdr} 
<path d="M 5 5 L 45 45 M 45 5 L 5 45" style="stroke:blue; stroke-width:4" />
</svg>`

// Use Scalable Vector Graphics to an O on the board.
const oSquare = `${svgHdr}
<ellipse cx="25" cy="25", rx="20", ry="20"
style="fill:none; stroke:blue; stroke-width:4" />
</svg>`

// Displayed when the game is over.
const restartHTML = `<button onclick="restartButton()">Play Again</button>`;

// A message area at the bottom of the screen.
const message = document.getElementById("message");

// Creates the pieces that make up the black lines of the board.
function blackRectangle(position, width, height) {
    const el = document.createElement("div");
    el.style =
    `${position}; width:${width}px; height:{$height}px; background-color:black;`
    return el;
}

// Will contain references to the nine cell elements of the board.
let cells = []
{
    // Create the board.
    const board = document.getElementById("board");

    // The order does not matter here, since each element gets
    // a grid-area style that specifies its position in the grid.

    // Create the cells, containers that will hold buttons, Xs or Os.
    for (let i = 0; i < 9; ++i) {
        const el = document.createElement("div");
        el.style =`grid-area:cell${i}`;
        cells.push(el);
        board.appendChild(el);
    }

    // Create the vertical bars that separate the cells on each row.
    for (let i = 0; i < 6; ++i) {
        board.appendChild(blackRectangle(`grid-area:vbar${i}`, "5", "50"));
    }

    // Create the horizonal bars that separate the cells on each row.
    for (let i = 0; i < 2; ++i) {
        board.appendChild(blackRectangle(`grid-area:hbar${i}`, "160", "5"));
    }
}

// Function invoked by the initial dialog. It initializes and starts the game.
function playButton() {
    switch (document.querySelector("input[name=who]:checked").value) {
        // Record the human and computer's pieces.
        case "first":
            globalThis.humanXO = "X";
            globalThis.computerXO = "O";
            break;
        case "second":
            globalThis.humanXO = "O";
            globalThis.computerXO = "X";
            break;
    }
    switch (document.querySelector("input[name=difficulty]:checked").value) {
        case "beatable":
            globalThis.beatable = true;
            break;
        case "unbeatable":
            globalThis.beatable = false;
            break;
    }

    // Array representation of the board. Values are "X", "O", and " ".
    // It is kept consistent with the cell elements in the DOM.
    globalThis.board = Array.from(" ".repeat(9));

    globalThis.gameOver = false;

    // Used to disable buttons during animation.
    globalThis.working = false;

    message.innerHTML = "<p>Click on a square to make a move</p>";

    // Turn off the selector and turn on the board and message.
    document.getElementById("selector").style.display = "none";
    document.getElementById("board").style.display = "grid";
    message.style.display = "block";

    // One splash per customer.
    document.getElementById("splash").style.display = "none";

    // Initialize the board.
    cells.forEach((val, i, a) =>
        a[i].innerHTML = board[i] == " " ? squareButton(i) : xSquare);

    // Add a warning on reload, since that will restart the game.
    // The value of the string returned does not appear to matter,
    // and I know no way to change the generic warning message.
    window.onbeforeunload = () => "";

    if (computerXO == "X") {
        MakeComputerMove();
    }
}

// Restarts the game with the player selection dialog.
function restartButton() {
    document.getElementById("selector").style.display = "block";
    document.getElementById("board").style.display = "none";
    message.style.display = "none";
}

// Flashes a square to emphasize the computer's move.
// Returns a promise that will resolve when the animation is over. 
function blinkSquare(id) {
    // Disable the buttons during the animation.
    working = true

    message.style.display = "none";
    return new Promise((resolve, reject) => {
        var counter = 0;
        const interval = setInterval(() => {
            counter += 1;
            cells[id].style.display = counter % 2 == 1 ? "none" : "block";
            if (counter >= 6) {
                clearInterval(interval);
                message.style.display = "block";
                working = false;
                resolve(null);
            }
         }, 100);
    });
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
        }});
    return moves;
}

// Returns the number of Xs and Os on the board.
function numberFilled(board) {
    return board.reduce((accum, current) =>
        current == " " ? accum : accum + 1, 0);
}

// Returns all the possible computer moves from this position.
function getComputerMoves(board) {
    if (numberFilled(board) % 2 == 0) {
        var me = 'X';
        var him = 'O';
    } else {
        var me = 'O';
        var him = 'X';
    }

    // See if the computer can win right now.
    let moves = checkTwoInARow(board, me);

    // If not, see if it needs to block.
    if (moves.length == 0) {
        moves = checkTwoInARow(board, him);
    }

    // If not, see if the board is the strategy table(s).
    if (moves.length == 0) {
        let lookupKey = board.join('');
        if (beatable) {
            moves = badMoves.get(lookupKey);
            if (moves === undefined) {
                moves = goodMoves.get(lookupKey);
            }
        } else {
            moves = goodMoves.get(lookupKey);
        }
    }

    // If not, find all the empty squares.
    if (moves === undefined) {
        moves = [];
        board.forEach((s, i) => {
            if (s == ' ') {
                moves.push(i);
            }
        });
    }
    return moves;
}

function MakeComputerMove() {
    moves = getComputerMoves(board);
    if (moves.length > 0) {
        // Choose one of the moves at random.
        let m = moves[Math.floor(Math.random() * moves.length)];

        // Write the computer move in both the board and the DOM.
        board[m] = computerXO;
        cells[m].innerHTML = computerXO == "X" ? xSquare : oSquare;

        // Flash the computer move, and proceed when the animation is over. 
        blinkSquare(m).then((x)=> {
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
