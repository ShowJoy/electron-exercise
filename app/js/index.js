'use strict';

let { ipcRenderer, remote, Tray, Menu } = require('electron');
var path = require('path');

var soundButtons = document.querySelectorAll('.button-sound');
var closeEl = document.querySelector('.close');
var settingsEl = document.querySelector('.settings');

var trayIcon = null;
var trayMenu = null;

for (var i = 0; i < soundButtons.length; i++) {
    var soundButton = soundButtons[i];
    var soundName = soundButton.attributes['data-sound'].value;

    prepareButton(soundButton, soundName);
}

if (window.Notification){
    if(Notification.permission ==='granted'){
        let notitfy = new Notification('Hello Notification', {body:"I hope that all the browser will support this function!"});
        notitfy.onclick = () => {
            alert('clicked!');
        };
    }else {
        document.getElementById('requestButton').onclick = function (){
            Notification.requestPermission();
        };
    };
} else {
    alert('你的浏览器不支持此特性，请下载谷歌浏览器试用该功能');
}

function prepareButton(buttonEl, soundName) {
    buttonEl.querySelector('span').style.backgroundImage = 'url("img/icons/' + soundName + '.png")';

    var audio = new Audio(__dirname + '/wav/' + soundName + '.wav');
    buttonEl.addEventListener('click', function () {
        audio.currentTime = 0;
        audio.play();
    });
}

closeEl.addEventListener('click', function () {
    ipcRenderer.send('close-main-window');
});

settingsEl.addEventListener('click', function () {
    ipcRenderer.send('open-settings-window');
});

ipcRenderer.on('global-shortcut', function (event, arg) {
    var event = new MouseEvent('click');
    soundButtons[arg].dispatchEvent(event);
});

document.querySelector('.drag').addEventListener('dragstart', evt => {
    event.preventDefault();
    ipcRenderer.send('ondragstart', path.join(__dirname, 'img/logo.png'));
});

if(window.Worker) {
    // let myWorker = new Worker('worker.js');
    // const first = document.querySelector('.first');
    // const second = document.querySelector('.second');

    // first.onchange = () => {
    //     myWorker.postMessage([first.value, second.value]);
    //     console.log('message posted to worker');
    // }
    // second.onchange = () => {
    //     myWorker.postMessage([first.value, second.value]);
    //     console.log('message posted to worker');
    // }

    // myWorker.onmessage = (e) => {
    //     console.log(e);
    //     console.log('message received from worker');
    // }
    var asyncEval = (function () {
        
    var aListeners = [], oParser = new Worker("data:text/javascript;charset=US-ASCII,onmessage%20%3D%20function%20%28oEvent%29%20%7B%0A%09postMessage%28%7B%0A%09%09%22id%22%3A%20oEvent.data.id%2C%0A%09%09%22evaluated%22%3A%20eval%28oEvent.data.code%29%0A%09%7D%29%3B%0A%7D");

    oParser.onmessage = function (oEvent) {
        if (aListeners[oEvent.data.id]) { aListeners[oEvent.data.id](oEvent.data.evaluated); }
        delete aListeners[oEvent.data.id];
    };


    return function (sCode, fListener) {
        aListeners.push(fListener || null);
        oParser.postMessage({
            "id": aListeners.length - 1,
            "code": sCode
        });
        };

    })();
    asyncEval('3 + 3', function(sMessage) {
        // alert('3+2=' + sMessage);
    })
}
