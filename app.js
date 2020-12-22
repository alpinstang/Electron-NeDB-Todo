const electron = require('electron')
const Datastore = require('nedb')
const url = require('url')
const path = require('path')
const menuBar = require('./src/components/MenuBar')

const { app, BrowserWindow, Menu, ipcMain } = electron

if (handleSquirrelEvent(app)) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

let mainWindow

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        webPreferences: { nodeIntegration: true }
    })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'src/index.html'),
        protocol: 'file:',
        slashes: true
    }))
    mainWindow.on('closed', () => app.quit())

    const mainMenu = Menu.buildFromTemplate(menuBar)
    Menu.setApplicationMenu(mainMenu)
})

const db = new Datastore({
    filename: './datastore/items.db',
    autoload: true
})

// Get all items from db and send them to the client
ipcMain.on('loadAll', () => db.find({}, (err, items) => mainWindow.webContents.send('loaded', items)))

//Saves item and returns it to client
ipcMain.on('addItem', (e, item) => {
    db.insert(item, err => {
        if (err) throw new Error(err)
    })

    mainWindow.webContents.send('added', item)
})

// Clears database and send event to client if sussesful
ipcMain.on('clearAll', () => {
    db.remove({}, { multi: true }, (err) => {
        if (err) throw new Error(err)
        mainWindow.webContents.send('cleared')
    })
})

function handleSquirrelEvent(application) {
    if (process.argv.length === 1) {
        return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);

    const spawn = function(command, args) {
        let spawnedProcess, error;

        try {
            spawnedProcess = ChildProcess.spawn(command, args, {
                detached: true
            });
        } catch (error) {}

        return spawnedProcess;
    };

    const spawnUpdate = function(args) {
        return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
        case '--squirrel-install':
        case '--squirrel-updated':
            // Optionally do things such as:
            // - Add your .exe to the PATH
            // - Write to the registry for things like file associations and
            //   explorer context menus

            // Install desktop and start menu shortcuts
            spawnUpdate(['--createShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-uninstall':
            // Undo anything you did in the --squirrel-install and
            // --squirrel-updated handlers

            // Remove desktop and start menu shortcuts
            spawnUpdate(['--removeShortcut', exeName]);

            setTimeout(application.quit, 1000);
            return true;

        case '--squirrel-obsolete':
            // This is called on the outgoing version of your app before
            // we update to the new version - it's the opposite of
            // --squirrel-updated

            application.quit();
            return true;
    }
};