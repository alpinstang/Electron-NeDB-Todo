const menuBar = [
    {
      label: 'file',
      submenu: [
        {
          label: 'Clear All',
          accelerator: process.platform == 'darwin' ? 'Command+C' : 'Ctrl+C',
          click(item, currentWindow) { currentWindow.webContents.send('clearAll') }
        }
      ]
    }, {
      label: 'DevTools',
      accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
      click(item, mainWindow) { mainWindow.toggleDevTools() }
    }
  ]

module.exports = menuBar;