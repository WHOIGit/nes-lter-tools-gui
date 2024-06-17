const { ipcRenderer } = require('electron');

const dropzone = document.getElementById('dropzone');

dropzone.addEventListener('dragover', (event) => {
  event.preventDefault();
  event.stopPropagation();
});

dropzone.addEventListener('drop', (event) => {
  event.preventDefault();
  event.stopPropagation();

  const filePath = event.dataTransfer.files[0].path;

  ipcRenderer.send('read-csv', { filePath });
});

ipcRenderer.on('csv-success', () => {
  alert('File processed successfully!');
});

ipcRenderer.on('csv-error', (event, { error }) => {
  alert(`An error occurred: ${error}`);
});
