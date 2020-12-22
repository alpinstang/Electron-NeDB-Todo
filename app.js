const electron = require('electron');
const url = require('url');
const path = require('path');

// Components
const menuBar = require('./src/components/MenuBar');

const { app, BrowserWindow, Menu, ipcMain } = electron;

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    webPreferences: { nodeIntegration: true } // This will allow us to use node specific tools like require in our client side javascript.
  });
  mainWindow.loadURL(url.format({
    // All this is doing is passing in to file://your_directory/src/index.html
    pathname: path.join(__dirname, 'src/index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Shut down app when window closes
  mainWindow.on('closed', () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuBar);
  Menu.setApplicationMenu(mainMenu);
});

const db = new Datastore({
    filename: './items.db',
    autoload: true
  })
  
  // Get all items from db and send them to the client
  ipcMain.on('loadAll', () => db.find({}, (err, items) => mainWindow.webContents.send('loaded', items)))
  
  // Saves item and returns it to client
  ipcMain.on('addItem', (e, item) => {
    db.insert(item, err => {
      if (err) throw new Error(err)
    })
  
    mainWindow.webContents.send('added', item)
  })

  // Clears database and send event to client if successful
ipcMain.on('clearAll', () => {
    // Without multi being set to true only the first matching item with be removed.
    db.remove({}, { multi: true }, (err) => {
      if (err) throw new Error(err)
      mainWindow.webContents.send('cleared')
    })
  })