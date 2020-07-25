'use strict'

var MINE = '💣';
var FLAG = '🚩';
var NEUTRAL = '😐'
var HAPPY = '😀';
var UPSET = '😩';
var BULB = '💡';
var BOOM = new Audio('sfx/boom.mp3');
var WIN = new Audio('sfx/win.mp3')

var gLevel;
var gGame;
var gBoard;

var randomMines;
var isHint;

function initGame(size = 4, mines = 2) {
    gLevel = {
        SIZE: size,
        MINES: mines
    }
    randomMines = placeMines(mines, size); //first argument is number of mines and the second is square root of the table size
    console.log(randomMines);
    gBoard = buildBoard(gLevel.SIZE);
    countNegs(gBoard);
    renderBoard(gBoard);
    isHint = false;
    gGame = {
        isOn: true, //when true let the user play
        showCount: 0, //how many cells are shown
        markedCount: 0, //how many cells are marked with a flag
        secsPassed: 0 //how many sec passed
    }
    showMinesLeft() //remove if bugs
    document.querySelector('button').innerHTML = NEUTRAL;
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

function countNegsWithoutMines(board, idxI, idxJ) {
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= board.length ||
                i < 0 || i >= board.length ||
                (i === idxI && j === idxJ)) continue;
            var currItem = board[i][j];
            if (currItem.minesAroundCount >= 0 && currItem.isMine === false && currItem.isShown === false) {
                currItem.isShown = true;
                gGame.showCount++
                document.querySelector(`.cell${i}-${j}`).classList.add('pressed')
                // countNegsWithoutMines(board, i, j) //recursion
                if (currItem.minesAroundCount > 0) document.querySelector(`.cell${i}-${j}`).innerHTML = currItem.minesAroundCount //shorter lines
                if (currItem.minesAroundCount === 0) countNegsWithoutMines(board, i, j) //shorter lines
                // } else if (currItem.minesAroundCount > 0 && currItem.isMine === false && currItem.isShown === false) {
                // currItem.isShown = true;
                // gGame.showCount++
                // document.querySelector(`.cell${i}-${j}`).innerHTML = currItem.minesAroundCount
                // document.querySelector(`.cell${i}-${j}`).classList.add('pressed')
            }
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
    document.querySelector(".hint").innerHTML = `<button class="hint_btn" onclick="giveHint(this)">${BULB}</button> 
    <button class="hint_btn" onclick="giveHint(this)">${BULB}</button> <button class="hint_btn" onclick="giveHint(this)">${BULB}</button>`
}

function cellClicked(elCell, i, j) {
    if (gGame.isOn) {
        // if (gBoard[i][j].isMine === true && gGame.showCount === 0) { //attempt for first click not mine
        //     renderBoard(gBoard);
        // } else {
        if (isHint === true) {
            revealNegs(i, j);
            isHint = false;
        } else {       
            stop();
            startStopwatch();
            var cell = gBoard[i][j]
            cell.isShown === false ? cell.isShown = true : cell.isShown = false;
            var elContainer = document.querySelector(`.cell${i}-${j}`)
            elContainer.classList.add('pressed')
            if (cell.isShown === true) { //first degree if statement with isShown 
                if (cell.minesAroundCount > 0 && cell.isMine === false) { //revealing each cell according to its content
                    elContainer.innerHTML = cell.minesAroundCount;
                    gGame.showCount++
                } else if (cell.minesAroundCount === 0 && cell.isMine === false) {
                    countNegsWithoutMines(gBoard, i, j) //make sure auto shown negs (from function) cannot be clicked either - done!
                    console.log(gBoard);
                    gGame.showCount++ //either here or in the function, make sure negs with 0 not counted twice - done!
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
            // } else {
            //     initGame()
        }
    }
}

function cellMarked(elCell, i, j) {
    if (gGame.isOn) {
        stop();
        startStopwatch();
        var cell = gBoard[i][j]
        cell.isMarked === false ? cell.isMarked = true : cell.isMarked = false;
        if (cell.isMarked === true) {
            gGame.markedCount++
            elCell.innerHTML = FLAG;
            showMinesLeft()
        }
        else {
            gGame.markedCount--
            elCell.innerHTML = null;
            showMinesLeft()
        }
        if (gGame.showCount === (gLevel.SIZE ** 2 - gLevel.MINES) && gGame.markedCount === gLevel.MINES) gameWon()
        console.log(gGame.markedCount);
    }
}

function checkGameOver() {
    gGame.isOn = false;
    BOOM.play();
    document.querySelector('button').innerHTML = UPSET;
    setTimeout(function () { alert('BOOM!') }, 100)
    stop()
};

function gameWon() {
    gGame.isOn = false;
    WIN.play();
    document.querySelector('button').innerHTML = HAPPY;
    setTimeout(function () { alert('You did it in ' + gGame.secsPassed + ' seconds!') }, 100)
    stop()
}

function revealNegs(idxI, idxJ) {
    var index = gBoard[idxI][idxJ];
    if (index.isMine === true) { //insert another condition - isShown === false?
        document.querySelector(`.cell${idxI}-${idxJ}`).innerHTML = MINE
    }
    else if (index.minesAroundCount > 0) { //insert another condition - isShown === false?
        document.querySelector(`.cell${idxI}-${idxJ}`).innerHTML = index.minesAroundCount
    }
    for (var i = idxI - 1; i <= idxI + 1; i++) {
        for (var j = idxJ - 1; j <= idxJ + 1; j++) {
            if (j < 0 || j >= gBoard.length ||
                i < 0 || i >= gBoard.length ||
                (i === idxI && j === idxJ)) continue;
            var currItem = gBoard[i][j];
            if (currItem.isMine === true) { //insert another condition - isShown === false?
                document.querySelector(`.cell${i}-${j}`).innerHTML = MINE
            }
            else if (currItem.minesAroundCount > 0) { //insert another condition - isShown === false?
                document.querySelector(`.cell${i}-${j}`).innerHTML = currItem.minesAroundCount
            }
        }
    }
    hideNegs(idxI, idxJ);
}

function hideNegs(idxI, idxJ) { //seems like the overwrite bug is completely fixed but not certain
    setTimeout(function () {
        var index = gBoard[idxI][idxJ];
        if (index.isMine === true && index.isShown === false && index.isMarked === false) {
            document.querySelector(`.cell${idxI}-${idxJ}`).innerHTML = null
        } else if (index.isMine === true && index.isShown === false && index.isMarked === true) {
            document.querySelector(`.cell${idxI}-${idxJ}`).innerHTML = FLAG
        } else if (index.minesAroundCount > 0 && index.isShown === false && index.isMarked === false) {
            document.querySelector(`.cell${idxI}-${idxJ}`).innerHTML = null
        }
        for (var i = idxI - 1; i <= idxI + 1; i++) {
            for (var j = idxJ - 1; j <= idxJ + 1; j++) {
                if (j < 0 || j >= gBoard.length ||
                    i < 0 || i >= gBoard.length ||
                    (i === idxI && j === idxJ)) continue;
                var currItem = gBoard[i][j];
                if (currItem.isMine === true && currItem.isShown === false && currItem.isMarked === false) {
                    document.querySelector(`.cell${i}-${j}`).innerHTML = null
                } else if (currItem.isMine === true && currItem.isShown === false && currItem.isMarked === true) {
                    document.querySelector(`.cell${i}-${j}`).innerHTML = FLAG
                }
                else if (currItem.minesAroundCount > 0 && currItem.isShown === false && currItem.isMarked === false) {
                    document.querySelector(`.cell${i}-${j}`).innerHTML = null
                }
            }
        }

    }, 1000)

}

function giveHint(elCell) {
    if (gGame.isOn) {
        if (isHint === false) {
            isHint = true;
            elCell.onclick = '';
            elCell.classList.add('hintPressed')
        } else {
            isHint = false;
        }
    }
}



