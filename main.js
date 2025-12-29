const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');
const fs = require('fs');

let serverProcess;
let mainWindow;
let splash; // Variable for the splash screen

const logPath = path.join(app.getPath('userData'), 'backend-log.txt');

function startBackend() {
    const serverPath = app.isPackaged
        ? path.join(process.resourcesPath, 'app.asar.unpacked', 'server.js')
        : path.join(__dirname, 'server.js');

    try {
        fs.appendFileSync(logPath, `Starting server at: ${serverPath}\n`);

        serverProcess = fork(serverPath, [], {
            env: { 
                ...process.env, 
                NODE_ENV: 'production',
                PORT: 5000,
                LOG_PATH: logPath 
            },
            stdio: ['ignore', 'pipe', 'pipe', 'ipc'] 
        });

        serverProcess.stdout.on('data', (data) => {
            fs.appendFileSync(logPath, `SERVER LOG: ${data}\n`);
        });

        serverProcess.stderr.on('data', (data) => {
            fs.appendFileSync(logPath, `SERVER ERROR: ${data}\n`);
        });
    } catch (err) {
        fs.appendFileSync(logPath, `FORK FATAL ERROR: ${err.message}\n`);
    }
}

function createWindow() {
    // 1. Create the Splash Screen Window
    splash = new BrowserWindow({
        width: 500,
        height: 350,
        transparent: true, // Allows for rounded corners and shadows
        frame: false,       // Removes standard Windows borders
        alwaysOnTop: true,
        icon: path.join(__dirname, 'build/icon.ico'),
        webPreferences: {
            nodeIntegration: false
        }
    });
    splash.loadFile('splash.html');

    // 2. Create the Main Window (hidden initially)
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false, // Don't show until it's finished loading
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
        },
        icon: path.join(__dirname, 'build', 'icon.ico'),
    });

    const loadPath = app.isPackaged 
        ? path.join(__dirname, 'frontend', 'dist', 'index.html') 
        : 'http://localhost:5173';

    if (app.isPackaged) {
        mainWindow.loadFile(loadPath);
    } else {
        mainWindow.loadURL(loadPath);
    }

    // 3. Smooth Fade Transition once the app is ready
    mainWindow.once('ready-to-show', () => {
        // Delay ensures the backend had time to initialize DB
        setTimeout(() => {
            let opacity = 1.0;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05; // Decrease transparency
                if (opacity <= 0) {
                    clearInterval(fadeInterval);
                    splash.close();  // Close splash completely
                    mainWindow.show(); // Reveal the main app
                } else {
                    splash.setOpacity(opacity);
                }
            }, 20); // Speed of the fade
        }, 1500); 
    });
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    if (serverProcess) serverProcess.kill();
    if (process.platform !== 'darwin') app.quit();
});