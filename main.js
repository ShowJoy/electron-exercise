'use strict';

let { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, MenuItem, ipcRenderer } = require('electron');
var configuration = require('./configuration');
var path = require('path');

var mainWindow = null;
var settingsWindow = null;

app.on('ready', function() {
    if (!configuration.readSettings('shortcutKeys')) {
        configuration.saveSettings('shortcutKeys', ['ctrl', 'shift']);
    }

    mainWindow = new BrowserWindow({
        // frame: false,
        // titleBarStyle: 'hiddenInset',
        // webPreferences: {enableBlinkFeatures: ''},
        height: 700,
        resizable: false,
        width: 368
    });

    mainWindow.loadURL('file://' + __dirname + '/app/index.html');
    // windows
    // mainWindow.setThumbarButtons([
    //     {
    //         tooltip: 'button1',
    //         icon: path.join(__dirname, 'app/img/tray-iconTemplate.png'),
    //         click() { console.log('hi'); }
    //     }
    // ]);

    // 进度条
    // mainWindow.setProgressBar(0.5);

    // windows
    // mainWindow.once('focus', () => mainWindow.flashFrame(false));
    // mainWindow.flashFrame(true);

    mainWindow.setRepresentedFilename(`${__dirname}/main.js`);
    mainWindow.setDocumentEdited(true);

    // mainWindow.webContents.openDevTools();

    // 键盘快捷键
    setGlobalShortcuts();

    let tray = null;
    if (process.platform === 'darwin') {
        tray = new Tray(path.join(__dirname, 'app/img/tray-iconTemplate.png'));
    }
    else {
        tray = new Tray(path.join(__dirname, 'app/img/tray-icon-alt.png'));
    }

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Sound machine',
            enabled: false
        },
        {
            label: 'Settings',
            accelerator: 'Ctrl+Shift+s',
            click: function (item, win, evt) {
                ipcMain.emit('open-settings-window');
            }
        },
        {
            label: 'Quit',
            click: function () {
                ipcMain.emit('close-main-window');
            }
        }
    ]);
    tray.setToolTip('This is my application.');
    tray.setContextMenu(contextMenu);
    app.dock.setMenu(contextMenu);

    const menu = new Menu();
    menu.append(new MenuItem({
        label: 'print',
        accelerator: 'Ctrl+p',
        click: () => console.log('clicked')
    }));
});

function setGlobalShortcuts() {
    globalShortcut.unregisterAll(); // 注销

    var shortcutKeysSetting = configuration.readSettings('shortcutKeys');
    var shortcutPrefix = shortcutKeysSetting.length === 0 ? '' : shortcutKeysSetting.join('+') + '+';

    globalShortcut.register(shortcutPrefix + '1', function () {
        mainWindow.webContents.send('global-shortcut', 0);
    });
    globalShortcut.register(shortcutPrefix + '2', function () {
        mainWindow.webContents.send('global-shortcut', 1);
    });
}

ipcMain.on('close-main-window', function () {
    app.quit();
});

ipcMain.on('open-settings-window', function () {
    if (settingsWindow) {
        return;
    }

    settingsWindow = new BrowserWindow({
        // frame: false,
        height: 200,
        resizable: false,
        width: 200
    });

    settingsWindow.setRepresentedFilename(`${__dirname}/main1.js`);
    settingsWindow.setDocumentEdited(true);

    settingsWindow.loadURL('file://' + __dirname + '/app/settings.html');

    settingsWindow.on('closed', function () {
        settingsWindow = null;
    });
});

ipcMain.on('close-settings-window', function () {
    if (settingsWindow) {
        settingsWindow.close();
    }
});

ipcMain.on('set-global-shortcuts', function () {
    setGlobalShortcuts();
});

ipcMain.on('ondragstart', (evt, filepath) => {
    evt.sender.startDrag({
        file: filepath,
        icon: path.join(__dirname, 'app/img/close.png')
    });
});
