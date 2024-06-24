const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const readline = require('readline');
const csv = require('csv-parser');

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
  let headersSent = false;

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('headers', (headers) => {
      // Clean headers: trim whitespace and remove double quotes
      const cleanedHeaders = headers.map(header => header.trim().replace(/^"|"$/g, ''));
      console.log('Column Headers:', cleanedHeaders);
      event.reply('csv-columns', { columns: cleanedHeaders });
      headersSent = true;
    })
    .on('data', () => {
      if (!headersSent) {
        // If no headers were sent and data is being processed, it means the file is valid
        // but we don't need to process further data for just reading headers
        this.destroy(); // Stop reading more data
      }
    })
    .on('end', () => {
      if (headersSent) {
        console.log('Finished reading column headers.');
        event.reply('csv-success');
      } else {
        // If end is reached and no headers were sent, file might be empty or invalid
        event.reply('csv-error', { error: 'Invalid or empty CSV file.' });
      }
    })
    .on('error', (err) => {
      // Handle any errors during parsing
      console.error('Error reading CSV file:', err);
      event.reply('csv-error', { error: 'Error reading CSV file.' });
    });
});