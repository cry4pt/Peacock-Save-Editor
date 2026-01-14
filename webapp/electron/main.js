const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');

let mainWindow;
let tray;
let nextServer;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: path.join(__dirname, '../public/apple-icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: true,
    title: 'Peacock Unlock All'
  });

  const startURL = process.env.ELECTRON_START_URL || 'http://localhost:3000';
  
  mainWindow.loadURL(startURL);
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('minimize', (event) => {
    event.preventDefault();
    mainWindow.hide();
  });

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
    return false;
  });
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/apple-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setToolTip('Peacock Unlock All');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
  });
}

function loadEnvFile() {
  const isDev = !app.isPackaged;
  const appPath = isDev ? path.join(__dirname, '..') : process.resourcesPath;
  const envPath = path.join(appPath, '.env.local');
  
  try {
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (line && !line.startsWith('#') && line.includes('=')) {
          const [key, ...valueParts] = line.split('=');
          const value = valueParts.join('=');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.error('Failed to load .env.local:', error);
  }
}

function checkServerRunning(port = 3000) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}`, (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startNextServer() {
  return new Promise(async (resolve, reject) => {
    const isDev = !app.isPackaged;
    const appPath = isDev ? path.join(__dirname, '..') : process.resourcesPath;
    
    // Load environment variables
    loadEnvFile();
    
    // Check if server is already running
    const serverRunning = await checkServerRunning();
    if (serverRunning) {
      console.log('Next.js server is already running on port 3000');
      resolve();
      return;
    }
    
    let serverCommand, serverArgs;
    
    if (isDev) {
      serverCommand = process.platform === 'win32' ? 'bun.exe' : 'bun';
      serverArgs = ['run', 'start'];
    } else {
      // In production, use Node.js (bundled with Electron) to run Next.js
      serverCommand = process.execPath;
      const nextServerPath = path.join(appPath, 'app.asar', 'node_modules', '.bin', 'next');
      serverArgs = [nextServerPath, 'start'];
    }
    
    console.log(`Starting Next.js server...`);
    console.log(`Command: ${serverCommand} ${serverArgs.join(' ')}`);
    console.log(`Working directory: ${appPath}`);
    console.log(`PEACOCK_PATH: ${process.env.PEACOCK_PATH}`);
    
    nextServer = spawn(serverCommand, serverArgs, {
      cwd: appPath,
      shell: true,
      env: { ...process.env }
    });

    let serverReady = false;

    nextServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(`Next.js: ${output}`);
      
      // Check if server is ready
      if (output.includes('Ready') || output.includes('started server')) {
        serverReady = true;
        resolve();
      }
    });

    nextServer.stderr.on('data', (data) => {
      const output = data.toString();
      console.error(`Next.js Error: ${output}`);
      
      // If port is in use, check if server is accessible
      if (output.includes('EADDRINUSE') || output.includes('port 3000 in use')) {
        console.log('Port in use, checking if server is accessible...');
        checkServerRunning().then(running => {
          if (running) {
            console.log('Server is accessible, proceeding...');
            resolve();
          }
        });
      }
    });

    nextServer.on('error', (error) => {
      console.error(`Failed to start Next.js server: ${error.message}`);
      // Don't reject, check if server is running anyway
      checkServerRunning().then(running => {
        if (running) {
          resolve();
        } else {
          reject(error);
        }
      });
    });

    nextServer.on('close', (code) => {
      console.log(`Next.js server exited with code ${code}`);
      if (code !== 0) {
        // Check if server is still accessible despite exit
        checkServerRunning().then(running => {
          if (running) {
            resolve();
          }
        });
      }
    });

    // Timeout fallback
    setTimeout(async () => {
      if (!serverReady) {
        const running = await checkServerRunning();
        if (running) {
          console.log('Server is running, proceeding...');
          resolve();
        } else {
          console.log('Server timeout - server may not be ready');
          resolve(); // Resolve anyway to open window
        }
      }
    }, 5000);
  });
}

app.whenReady().then(async () => {
  try {
    await startNextServer();
    console.log('Next.js server started, creating window...');
    createWindow();
    createTray();
  } catch (error) {
    console.error('Failed to start server:', error);
    // Still create window to show error
    createWindow();
    createTray();
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  if (nextServer) {
    nextServer.kill();
  }
});
