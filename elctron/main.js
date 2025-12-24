const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let backendProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // During development, point to Vite/React dev server
  // In production, you would point to the build/index.html
  mainWindow.loadURL('http://localhost:5173'); 

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Start the Express Backend
function startBackend() {
  backendProcess = spawn('node', [path.join(__dirname, '../backend/server.js')], {
    shell: true,
    env: { ...process.env, PORT: 5000 }
  });

  backendProcess.stdout.on('data', (data) => console.log(`Backend: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`Backend Error: ${data}`));
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // Kill backend process when app closes
    if (backendProcess) backendProcess.kill();
    app.quit();
  }
});
