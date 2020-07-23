'use strict'

var MINE = '💣';
var FLAG = '🚩';
var NEUTRAL = '😐'
var HAPPY = '😀';
var UPSET = '😩';
var BOOM = new Audio('sfx/boom.mp3');
var WIN = new Audio('sfx/win.mp3')

var gLevel = { //the board size is set accordignly
    SIZE: 0,
    MINES: 0
}

var gGame;
var gBoard;

var randomMines;

function initGame(size = 4, mines = 2) {
    gLevel.SIZE = size;
    gLevel.MINES = mines;
    randomMines = placeMines(mines, size); //first argument is number of mines and the second is square root of the table size
    console.log(randomMines);
    gBoard = buildBoard(gLevel.SIZE);
    countNegs(gBoard);
    renderBoard(gBoard);
    document.querySelector('button').innerHTML = NEUTRAL;
    gGame = {
        isOn: false, //when true let the user play
        showCount: 0, //how many cells are shown
        markedCount: 0, //how many cells are marked with a flag
        secsPassed: 0 //how many sec passed
    }
};

function placeMines(length, size) {
    var array = [];
    var random;
    for (var i = 0; i < length; i++) {
        random = getRandomIntInclusive(0, size ** 2 - 1);
        (!array.includes(random)) ? array.push(random) : i--
    }
    return array;
}

function buildBoard(size) {
    var board = [];
    var count = 0;
    for (var i = 0; i < size; i++) {
        board[i] = [];
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isShown: false,
                isMine: false,
                isMarked: false,
                id: count++
            };
            // if (i === 2 && j === 1 || i === 3 && j === 3) board[i][j].isMine = true;
            if (randomMines.includes(board[i][j].id)) board[i][j].isMine = true;
        }
    }
    return board;
};

function countNegs(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            setMinesNegsCount(board, i, j)
        }
    }
    return board;
}

function setMinesNegsCount(board, idxI, idxJ) {
    var index = board[idxI][idxJ];
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= board.length ||
                i < 0 || i >= board.length ||
                (i === idxI && j === idxJ)) continue;
            var currItem = board[i][j];
            if (currItem.isMine === true) index.minesAroundCount++
        }
    }
}

function renderBoard(board) {
    var strHTML = '<table border="0"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            var cell = board[i][j];
            var className = 'cell cell' + i + '-' + j;
            if (cell.isMine === true) {
                strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
            } else if (cell.minesAroundCount === 0) {
                strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
            } else strHTML += `<td class="${className}" onclick="cellClicked(this, ${i}, ${j})" oncontextmenu="cellMarked(this, ${i}, ${j})"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(".board");
    elContainer.innerHTML = strHTML;
}

function cellClicked(elCell, i, j) {
    stop();
    startStopwatch();
    var cell = gBoard[i][j]
    cell.isShown === false ? cell.isShown = true : cell.isShown = false;
    var elContainer = document.querySelector(`.cell${i}-${j}`)
    elContainer.classList.add('pressed')
    // if(cell.isMine === true && gGame.showCount === 0) return;
    if (cell.isShown === true) { //first degree if statement with isShown 
        if (cell.minesAroundCount > 0 && cell.isMine === false) { //revealing each cell according to its content
            elContainer.innerHTML = cell.minesAroundCount;
            gGame.showCount++
        } else if (cell.minesAroundCount === 0 && cell.isMine === false) {
            gGame.showCount++
        } else {
            elContainer.innerHTML = MINE;
            for (var i = 0; i < gBoard.length; i++) {
                for (var j = 0; j < gBoard.length; j++) { //itirates through all the other mines in board to reveal them as well
                    if (gBoard[i][j].isMine === true && gBoard[i][j] !== cell) {
                        document.querySelector(`.cell${i}-${j}`).innerHTML = MINE
                        elCell.style.backgroundColor = 'red';
                    }
                }
            }
            checkGameOver()
        }
    } else {
        elCell.onclick = "";
    }
   if (gGame.showCount === (gLevel.SIZE ** 2 - gLevel.MINES) && gGame.markedCount === gLevel.MINES) gameWon()
    console.log('game count', gGame.showCount);
}

function cellMarked(elCell, i, j) {
    stop();
    startStopwatch();
    var cell = gBoard[i][j]
    cell.isMarked === false ? cell.isMarked = true : cell.isMarked = false;
    if (cell.isMarked === true) {
        gGame.markedCount++
        elCell.innerHTML = FLAG;
    }
    else {
        gGame.markedCount--
        elCell.innerHTML = null;
    }
    if (gGame.showCount === (gLevel.SIZE ** 2 - gLevel.MINES) && gGame.markedCount === gLevel.MINES) gameWon()
    console.log(gGame.markedCount);
}

function checkGameOver() {
    BOOM.play();
    document.querySelector('button').innerHTML = UPSET;
    setTimeout(function () { alert('BOOM!') }, 100)
    stop()
};

function gameWon() {
    WIN.play();
    document.querySelector('button').innerHTML = HAPPY;
    setTimeout(function () { alert('You did it in ' + gGame.secsPassed + ' seconds!') }, 100)
    stop()
}



