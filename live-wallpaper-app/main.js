const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const screen = electron.screen;
const win32 = require('win32-api');
const user32 = win32.User32.load();

let mainWindow;
let wallpaperWindow;

// Windows API functions
const FindWindow = user32.FindWindowW;
const SetParent = user32.SetParent;

function createMainWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        // icon: path.join(__dirname, 'assets', 'icon.png') // Add an icon if available
    });

    mainWindow.loadFile('index.html');

    // Open DevTools in development
    // mainWindow.webContents.openDevTools();

    mainWindow.on('closed', () => {
        mainWindow = null;
        if (wallpaperWindow) {
            wallpaperWindow.close();
        }
    });
}

function createWallpaperWindow(filePath) {
    if (wallpaperWindow) {
        wallpaperWindow.close();
    }

    const primaryDisplay = screen.getPrimaryDisplay();
    const { width, height } = primaryDisplay.workAreaSize;

    wallpaperWindow = new BrowserWindow({
        width: width,
        height: height,
        x: 0,
        y: 0,
        frame: false,
        alwaysOnTop: false,
        skipTaskbar: true,
        transparent: true,
        show: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    wallpaperWindow.on('closed', () => {
        wallpaperWindow = null;
    });

    // Send the file path to the wallpaper window
    wallpaperWindow.webContents.on('did-finish-load', () => {
        // Check if wallpaperWindow is still valid (not closed or destroyed)
        if (!wallpaperWindow || wallpaperWindow.isDestroyed()) {
            console.warn('Wallpaper window was closed or destroyed before setup could complete.');
            return;
        }

        try {
            if (!wallpaperWindow.webContents) {
                console.error('Wallpaper window webContents is not available.');
                return;
            }

            wallpaperWindow.webContents.send('set-wallpaper', filePath);

            // Get the native window handle
            const hwnd = wallpaperWindow.getNativeWindowHandle();

            // Find the Program Manager window (desktop)
            const progmanHwnd = FindWindow(null, 'Program Manager');

            if (progmanHwnd) {
                // Set the wallpaper window as a child of Program Manager
                SetParent(hwnd, progmanHwnd);
            } else {
                console.warn('Could not find Program Manager window for setting wallpaper parent.');
            }

            wallpaperWindow.show();
        } catch (error) {
            console.error('Error setting up wallpaper window:', error);
            // Optionally close the window if setup fails
            if (wallpaperWindow && !wallpaperWindow.isDestroyed()) {
                wallpaperWindow.close();
            }
        }
    });

    wallpaperWindow.loadFile('wallpaper.html');
}

if (app) {
    app.on('ready', createMainWindow);

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });

    // IPC handlers
    ipcMain.handle('select-file', async () => {
        const result = await dialog.showOpenDialog(mainWindow, {
            properties: ['openFile'],
            filters: [
                { name: 'Videos and GIFs', extensions: ['mp4', 'avi', 'mov', 'gif'] }
            ]
        });

        if (!result.canceled) {
            return result.filePaths[0];
        }
        return null;
    });

    ipcMain.on('set-wallpaper', (event, filePath) => {
        createWallpaperWindow(filePath);
    });

    ipcMain.on('close-wallpaper', () => {
        if (wallpaperWindow) {
            wallpaperWindow.close();
        }
    });
} else {
    console.error('Electron app is not available');
}