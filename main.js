const { app, BrowserWindow, ipcMain, Menu, MenuItem } = require('electron')
const net = require('net');
var Convert = require('ansi-to-html');
var convert = new Convert();
var client = new net.Socket();

//Menu Structure
const menuTemplate = [
  {
    label: 'Server',
    submenu: [
      {
        label: 'Connect',
        accelerator: 'Alt+C',
        click (item, focusedWindow) {
          console.log("Connected");
        }
      },
      {
        label: 'Disconnect',
        accelerator: 'Alt+Q',
        click (item, focusedWindow) {
          console.log("Disconnected");
        }
      },
      {
        label: 'Reconnect',
        accelerator: 'Alt+R',
        click (item, focusedWindow) {
          client.destroy();
          BrowserWindow.getFocusedWindow().webContents.send('clientInstructions', "cls");
          connect(BrowserWindow.getFocusedWindow());
        }
      },
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Terminal',
        accelerator: 'CmdOrCtrl+T',
        click (item, focusedWindow) {
          console.log("Terminal");
        }
      },
      {
        label: 'Map',
        accelerator: 'CmdOrCtrl+M',
        click (item, focusedWindow) {
          console.log("Map");
        }
      },
   ]
  }
]

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  });

  win.loadFile('index.html');
  //win.webContents.openDevTools();

  //Establish Socket Connection after Site has loaded
  win.webContents.on('did-finish-load', function () {
    connect(win);
  })
}

const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function connect(win) {
  client = new net.Socket();

  client.connect(7575, '127.0.0.1', function() {
      console.log('connected');
      client.write("l");
      //TODO: Send Message to Server to indicate that the custom client is used
  });

  client.on('data', function(data) {
    data = data.toString();
    data = data.replace(/\r\n/g, '<br>');
      win.webContents.send('data', convert.toHtml(data));
  });
  
  client.on('close', function() {
    console.log('Connection closed');
  });

  ipcMain.on('data', function(event, data) {
    client.write(data.toString());
  });
}