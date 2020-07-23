'use strict'
var counterStopwatch = 0;
var ID = 0;

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function stopwatch() {
    var clock = document.querySelector('h2');
    clock.innerHTML = gGame.secsPassed
    gGame.secsPassed++
}

function startStopwatch() {
    ID = setInterval(stopwatch, 1000);

}

function stop() {
    clearInterval(ID)
}

