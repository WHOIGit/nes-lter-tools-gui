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
});

ipcRenderer.on('csv-error', (event, { error }) => {
  alert(`An error occurred: ${error}`);
});

ipcRenderer.on('csv-columns', (event, { columns }) => {
  console.log(columns);
  dropzone.style.display = 'none';
  const headerList = document.getElementById('columns');
  columns.forEach((column) => {
    const li = document.createElement('div');
    li.className = 'col-header';
    li.textContent = column;
    headerList.appendChild(li);
  });
});

