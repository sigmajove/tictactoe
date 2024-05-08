// The strategy table.
let goodMoves = new Map();

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

// Adds the moves dictated by an one of the strategy patterns.
function addGoodMoves(board) {
    let moves = [];
    let boardArr = board.split("");

    for (let i = 0; i < boardArr.length; ++i) {
        if (boardArr[i] == "$") {
            moves.push(i);
            boardArr[i] = " ";
        }
    }
    goodMoves.set(boardArr.join(""), moves);
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
    for (let i = 0; i < patterns.length; ++i) {
        symmetry((b) => { addGoodMoves(b); }, patterns[i]);
    }
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

// Returns all the possible good computer moves from this position.
function getComputerMove(board) {
    let count = 0;
    board.forEach((p) => {if (p != " ") {++count};});
    if (count % 2 == 0) {
        var me = "X";
        var him = "O";
    } else {
        var me = "O";
        var him = "X";
    }

    // See if I can win right now.
    let moves = checkTwoInARow(board, me);

    // If not, see if it needs to block.
    if (moves.length == 0) {
        moves = checkTwoInARow(board, him);
    }

    // If not, see if the board is in GoodMoves.
    if (moves.length == 0) {
        moves = goodMoves.get(board.join(""));
    }

    // If not, just pick any empty square.
    if (moves === undefined) {
        moves = [];
        for (let i = 0; i < 9; ++i) {
            if (board[i] == " ") {
                moves.push(i);
            }
        }
    }

    // Return one of the moves at random, or null if there is none.
    // There should always be one. 
    return moves.length == 0 ? null :
        moves[Math.floor(Math.random() * moves.length)];
}

function hasWinner(board) {
    let winner = false;
    checkRows((x, y, z) => {
        let bx = board[x];
        let by = board[y];
        let bz = board[z];
        if (bx == by && by == bz && bx != " ") {
            winner = true;
        }});
    return winner;
}

function boardFull(board) {
    let count = 0;
    board.forEach((p) => {if (p == " ") {++count};});
    return count == 0;
}

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

// Array representation of the board. Values are "X", "O", and " ".
// It is kept consistent with the cell elements in the DOM.
let board = null;

let gameOver = null;

// Used to disable buttons during animation.
let working = false;

// Which players are which. The values are "X" or "O".
let myXO = null;
let computerX0 = null;

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
        case "first":
            myXO = "X";
            computerXO = "O";
            break;
        case "second":
            myXO = "O";
            computerXO = "X";
            break;
    }

    gameOver = false;
    board = Array.from(" ".repeat(9));
    if (myXO == "O") {
        // It does not matter where the first move goes.
        board[Math.floor(Math.random() * 9)] = "X";
    }
    message.innerHTML = "<p>Click on a square to make a move</p>";

    // Turn off the selector and turn on the board and message.
    document.getElementById("selector").style.display = "none";
    document.getElementById("board").style.display = "grid";
    message.style.display = "block";

    // Initialize the board.
    for (let i = 0; i < cells.length; ++i) {
        cells[i].innerHTML = board[i] == " " ? squareButton(i) : xSquare;
    }

    // Add a warning on reload, since that will restart the game.
    // The value of the string returned does not appear to matter,
    // and there is no way to change the generic warning message.
    window.onbeforeunload = () => "";
}

// Restarts the game with the player selection dialog.
function restartButton() {
    document.getElementById("selector").style.display = "block";
    document.getElementById("board").style.display = "none";
    message.style.display = "none";
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

// Adds the moves dictated by an one of the strategy patterns.
function addGoodMoves(board) {
    let moves = [];
    let boardArr = board.split("");

    for (let i = 0; i < boardArr.length; ++i) {
        if (boardArr[i] == "$") {
            moves.push(i);
            boardArr[i] = " ";
        }
    }
    goodMoves.set(boardArr.join(""), moves);
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
    for (let i = 0; i < patterns.length; ++i) {
        symmetry((b) => { addGoodMoves(b); }, patterns[i]);
    }
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

// Returns true if the game is over.
function checkGameOver(who) {
    let winner = false;
    checkRows((x, y, z) => {
        let bx = board[x];
        let by = board[y];
        let bz = board[z];
        if (bx == by && by == bz && bx != " ") {
            winner = true;
        }});
    if (winner) {
        message.innerHTML = `<h3>${who} wins ${restartHTML}</h3>`;
        return true;
    }
    for (let i = 0; i < 9; ++i) {
        if (board[i] == " ") {
            return false;
        }
    }
    // The game ended in a draw.
    message.innerHTML = `<h3>Tie game ${restartHTML}</h3>`;
    return true;
}

// If a row contains two whos in a row and a space, returns
// the index of the space. Returns every such index, may be empty.
function checkTwoInARow(who) {
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

// Returns all the possible good computer moves from this position.
function getComputerMove() {
    // See if it can win right now.
    let moves = checkTwoInARow(computerXO);

    // If not, see if it needs to block.
    if (moves.length == 0) {
        moves = checkTwoInARow(myXO);
    }

    // If not, see if the board is in GoodMoves.
    if (moves.length == 0) {
        moves = goodMoves.get(board.join(""));
    }

    // If not, just pick any empty square.
    if (moves === undefined) {
        moves = [];
        for (let i = 0; i < 9; ++i) {
            if (board[i] == " ") {
                moves.push(i);
            }
        }
    }

    // Return one of the moves a random, or null if there is none.
    // There should always be one. 
    return moves.length == 0 ? null :
        moves[Math.floor(Math.random() * moves.length)];
}

// Invoked when the user clicks on a square.
function clickSquare(id) {
    if (working || gameOver || board[id] != " ") {
        return;
    }

    // Write the player move in both the board and the DOM.
    board[id] = myXO;
    cells[id].innerHTML = myXO == "X" ? xSquare : oSquare;

    if (checkGameOver(myXO)) {
        gameOver = true;
        window.onbeforeunload = undefined;
        return;
    }

    m = getComputerMove();
    if (m !== null) {
        // Write the computer move in both the board and the DOM.
        board[m] = computerXO;
        cells[m].innerHTML = computerXO == "X" ? xSquare : oSquare;

        // Flash the computer move, and proceed when the animation is over. 
        blinkSquare(m).then((x)=> {
            if (checkGameOver(computerXO)) {
                gameOver = true;
                window.onbeforeunload = undefined;
            }
        });
    }
}
