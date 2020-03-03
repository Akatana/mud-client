const {ipcRenderer} = require('electron');
let terminal = document.getElementById('terminal');
let gameConsole = document.getElementById('console');
let gameInput = document.getElementById('textInput');
let commandHistory = [""];
let commandIndex = 0;

$("#terminal").draggable();
$('#terminal').resizable();

ipcRenderer.on('data', function (event, data) {
    gameConsole.innerHTML += data;
    gameConsole.scrollTop = gameConsole.scrollHeight;
});

ipcRenderer.on('clientInstructions', function (event, data) {
    if (data == "cls") {
        //Clear console
        gameConsole.innerHTML = "";
    }
});

gameInput.addEventListener('keyup', function (event) {
    //Enter
    if (event.keyCode === 13) {
        ipcRenderer.send('data', gameInput.value);
        commandHistory.push(gameInput.value);
        commandIndex = commandHistory.length - 1;
        gameInput.select();
    }
    //Up
    else if (event.keyCode === 38) {
        if (commandIndex > 0) {
            commandIndex--;
        }
        gameInput.value = commandHistory[commandIndex];
        gameInput.select();
    }
    //Down
    else if (event.keyCode === 40) {
        if (commandIndex < commandHistory.length - 1) {
            commandIndex++;
        }
        gameInput.value = commandHistory[commandIndex];
        gameInput.select();
    }
});