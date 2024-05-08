const logic = require('./logic.js');

function printBoard(board) {
    console.log(` ${board[0]} | ${board[1]} | ${board[2]}`);
    console.log(`---+---+---`);
    console.log(` ${board[3]} | ${board[4]} | ${board[5]}`);
    console.log(`---+---+---`);
    console.log(` ${board[6]} | ${board[7]} | ${board[8]}`);
}

function hasWinner(board) {
    let winner = false;
    logic.checkRows((x, y, z) => {
        let bx = board[x];
        let by = board[y];
        let bz = board[z];
        if (bx == by && by == bz && bx != " ") {
            winner = true;
        }
    });
    return winner;
}

function boardFull(board) {
    let count = 0;
    board.forEach((p) => {
        if (p == " ") {
            ++count
        };
    });
    return count == 0;
}

function playGame() {
    board = Array(9).fill(" ");
    let me = "X";
    let him = "O";
    for (;;) {
        let m = logic.getOptimalMove(board);
        if (board[m] != " ") {
            console.log(`invalid move ${m}`);
            throw new Error("invalid move");
        }
        board[m] = me;
        if (hasWinner(board)) {
            throw new Error("somebody won");
        }
        if (boardFull(board)) {
            break;
        }
        [me, him] = [him, me];
    }
}

// Returns a random valid move, null if there is none.
function randomMove(board) {
    moves = [];
    for (let i = 0; i < board.length; ++i) {
        if (board[i] == " ") {
            moves.push(i);
        }
    }
    if (moves.length == 0) {
        throw new error("There is no move");
    }
    return moves[Math.floor(Math.random() * moves.length)];
}

function randGame() {
    board = Array(9).fill(" ");
    let me = "X";
    let him = "O";
    for (;;) {
        if (me == "X") {
            var m = logic.getOptimalMove(board);
        } else {
            var m = randomMove(board);
        }
        if (board[m] != " ") {
            console.log(`invalid move ${m}`);
            throw new Error("invalid move");
        }
        board[m] = me;
        if (hasWinner(board)) {
            return me;
        }
        if (boardFull(board)) {
            return " ";
        }
        [me, him] = [him, me];
    }
}

let move_trace = [];
let throw_trace = [];

function numberFilled(board) {
    return board.reduce((accum, current) =>
        current == " " ? accum : accum + 1, 0);
}

// Returns true if no matter what X does, O has a path to victory.
function exploreThrowHumanO(board) {
    newboard = [...board]
    // Get all the X moves.
    moves = logic.getThrowMoves(newboard);
    if (moves === undefined) {
        return false;
    }
    let outer = true; // if every move has a path to O victory
    moves.forEach((xMove) => {
        if (newboard[xMove] != " ") {
            throw new Error("not blank");
        }
        newboard[xMove] = "X";
        move_trace.push(xMove);
        if (hasWinner(newboard)) {
            outer = false;
        } else if (numberFilled(newboard) == 9) {
            outer = false;
        } else {
            let inner = false; // If at least one move has a path to O victory.
            for (let oMove = 0; oMove < newboard.length; ++oMove) {
                if (newboard[oMove] == " ") {
                    move_trace.push(oMove);
                    newboard[oMove] = "O";
                    if (hasWinner(newboard)) {
                        inner = true;
                    } else if (numberFilled(newboard) == 9) {
                    } else {
                        let j = exploreThrowHumanO(newboard);
                        inner ||= j;
                    }
                    newboard[oMove] = " ";
                    move_trace.pop();
                }
            }
            outer &&= inner;
        }
        move_trace.pop();
        newboard[xMove] = " ";
    });
    return outer;
}

// Returns true if no matter what O does, X has a path to victory.
// Must be called on O's turn.
function exploreThrowHumanX(board) {
    newboard = [...board]
    // Get all the O moves.
    moves = logic.getThrowMoves(newboard);
    if (moves === undefined) {
        return false;
    }
    let outer = true; // if every move has a path to X victory
    moves.forEach((oMove) => {
        if (newboard[oMove] != " ") {
            throw new Error("not blank");
        }
        newboard[oMove] = "O";
        move_trace.push(oMove);
        if (hasWinner(newboard)) {
            outer = false;
        } else if (numberFilled(newboard) == 9) {
            outer = false;
        } else {
            let inner = false; // If at least one move has a path to X victory.
            for (let xMove = 0; xMove < newboard.length; ++xMove) {
                if (newboard[xMove] == " ") {
                    move_trace.push(xMove);
                    newboard[xMove] = "X";
                    if (hasWinner(newboard)) {
                        inner = true;
                    } else if (numberFilled(newboard) == 9) {
                    } else {
                        let j = exploreThrowHumanX(newboard);
                        inner ||= j;
                    }
                    newboard[xMove] = " ";
                    move_trace.pop();
                }
            }
            outer &&= inner;
        }
        move_trace.pop();
        newboard[oMove] = " ";
    });
    return outer;
}

function exploreGame(board, turn) {
    if (boardFull(board)) {
        if (throw_trace.length == 0) {
            console.log(move_trace);
            printBoard(board);
            throw new Error("Could not throw");
        }
        return;
    }
    const has_bad = logic.badMoves.has(board.join(""));
    if (has_bad) {
        throw_trace.push(turn);
    }
    logic.getOptimalMoves(board).forEach((m) => {
        move_trace.push(m);
        board[m] = "X";
        if (hasWinner(board)) {
            console.log(move_trace);
            printBoard(board);
            throw new Error("X should not win");
        }
        if (boardFull(board)) {
            console.log(move_trace);
            printBoard(board);
            throw new Error("Could not throw");
        } else {
            logic.getOptimalMoves(board).forEach((i) => {
                move_trace.push(i)
                board[i] = "O";
                if (hasWinner(board)) {
                    console.log(move_trace);
                    printBoard(board);
                    throw new Error("O should not win");
                }
                if (boardFull(board)) {
                    if (throw_trace.length == 0) {
                        console.log(move_trace);
                        printBoard(board);
                        throw new Error("Could not throw");
                    }
                } else {
                    exploreGame(board, turn + 2);
                }
                move_trace.pop();
                board[i] = " ";
            });
        }
        move_trace.pop();
        board[m] = " ";
    });
    if (has_bad) {
        throw_trace.pop();
    }
}

function exploreTest() {
    board = Array(9).fill(" ");
    let success = exploreThrowHumanO(board);
    if (!success) {
        printBoard(board);
        throw new Error("Human O didn't win");
    }

    board.fill(" ");
    for (let i = 0; i < board.length; ++i) {
        board[i] = "X";
        success = exploreThrowHumanX(board);
        if (!success) {
            throw new Error("Human O didn't win");
        }
        board[i] = " ";
    }
    logic.report(printBoard);
}

const iterations = 100000;
for (let i = 0; i < iterations; ++i) {
    playGame();
}
for (let i = 0; i < iterations; ++i) {
    outcome = randGame();
    if (outcome == "O") {
        throw new Error("How did O win?");
    }
}
exploreTest();

console.log("Test passed");
