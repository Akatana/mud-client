const { app, BrowserWindow, ipcMain } = require('electron')
const net = require('net');
var Convert = require('ansi-to-html');
var convert = new Convert();

function createWindow () {
  // Erstelle das Browser-Fenster.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  // and load the index.html of the app.
  win.loadFile('index.html')

  // Öffnen der DevTools.
  //win.webContents.openDevTools()

  let client = new net.Socket();

  win.webContents.on('did-finish-load', function () {
    client.connect(7575, '127.0.0.1', function() {
        console.log('connected');
        client.write("l");
        //Send Message to Server to indicate that the custom client is used
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
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Einige APIs können nur nach dem Auftreten dieses Events genutzt werden.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // Unter macOS ist es üblich, für Apps und ihre Menu Bar
  // aktiv zu bleiben, bis der Nutzer explizit mit Cmd + Q die App beendet.
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // Unter macOS ist es üblich ein neues Fenster der App zu erstellen, wenn
  // das Dock Icon angeklickt wird und keine anderen Fenster offen sind.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. Sie können den Code auch 
// auf mehrere Dateien aufteilen und diese hier einbinden.