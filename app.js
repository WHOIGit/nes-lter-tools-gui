const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('read-csv', (event, { filePath }) => {
  // Create a readline interface
  const rl = readline.createInterface({
    input: fs.createReadStream(filePath),
    crlfDelay: Infinity
  });

  // Read the first line (column headers)
  rl.once('line', (line) => {
    // check that line matches a CSV column header line using a regex
    if (!line.match(/^[\w\s,"]+$/)) {
      event.reply('csv-error', { error: 'Invalid CSV file.' });
      rl.close(false);
      return;
    }
    const headers = line.split(',');
    // trim headers to remove any leading/trailing whitespace
    headers.forEach((header, index) => {
      headers[index] = header.trim();
    });
    // now trim any double quotes
    headers.forEach((header, index) => {
      headers[index] = header.replace(/^"|"$/g, '');
    });
    console.log('Column Headers:', headers);
    event.reply('csv-columns', { columns: headers });
    rl.close(true);
  });

  // Close the readline interface when done
  rl.on('close', (valid) => {
    if (!valid) {
      return;
    }
    console.log('Finished reading column headers.');
    event.reply('csv-success');
  });
});