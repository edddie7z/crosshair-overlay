const { app, BrowserWindow, ipcMain, screen } = require("electron");
const path = require("path");

// Keep a global reference of the window objects to avoid garbage collection
let mainWindow;
let overlayWindow;
let isControlsVisible = true;
let miniControlPosition = { x: 10, y: 10 };

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window in fullscreen mode
  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    fullscreen: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });
  // Create the overlay window for mini controls
  overlayWindow = new BrowserWindow({
    width: 70,
    height: 32,
    x: miniControlPosition.x,
    y: miniControlPosition.y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    movable: false,
    focusable: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });

  // Load the index.html file
  mainWindow.loadFile("index.html");

  // Load the overlay.html file
  overlayWindow.loadFile("overlay.html");

  // Initially hide the overlay window until click-through is activated
  overlayWindow.hide();

  // Make the overlay window NOT click-through so buttons remain clickable
  overlayWindow.setIgnoreMouseEvents(false);

  // Open the DevTools in development mode
  // mainWindow.webContents.openDevTools();
  // overlayWindow.webContents.openDevTools();

  // Emitted when the window is closed
  mainWindow.on("closed", () => {
    if (overlayWindow) {
      overlayWindow.close();
    }
    mainWindow = null;
  });

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });
}

// Create window when Electron has finished initialization
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle("toggle-mouse-events", (event, ignore) => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      isControlsVisible = !ignore;

      // Logging the state change with a clear message
      console.log(
        `Setting ignoreMouseEvents to ${ignore} (controls visible: ${isControlsVisible})`
      );

      if (ignore) {
        try {
          // Enable click-through mode - make main window completely click-through
          mainWindow.setIgnoreMouseEvents(ignore, { forward: true });
        } catch (err) {
          console.error(
            "Error setting ignore mouse events with forward option:",
            err
          );
          // Fallback for older versions
          mainWindow.setIgnoreMouseEvents(ignore);
        }
      } else {
        // Disable click-through mode - make main window interactive again
        mainWindow.setIgnoreMouseEvents(false);
      }
      return true;
    } else {
      console.warn(
        "Cannot toggle mouse events: mainWindow is null or destroyed"
      );
      return false;
    }
  } catch (error) {
    console.error("Error in toggle-mouse-events handler:", error);
    return false;
  }
});

// Handle showing mini controls
ipcMain.handle("update-mini-controls", (event, bounds) => {
  try {
    if (overlayWindow && !overlayWindow.isDestroyed() && bounds) {
      // Update the overlay window position based on the bounds
      miniControlPosition = { x: bounds.x, y: bounds.y };
      overlayWindow.setPosition(bounds.x, bounds.y);

      // Ensure the overlay window is the right size
      overlayWindow.setSize(bounds.width || 70, bounds.height || 32);

      // Send the opacity to the overlay window
      overlayWindow.webContents.send("update-position", {
        x: 0,
        y: 0,
        opacity: bounds.opacity || 0.8,
      });

      // Make sure it's always on top
      if (!overlayWindow.isAlwaysOnTop()) {
        overlayWindow.setAlwaysOnTop(true, "screen-saver");
      }

      // Always show the overlay window when in click-through mode
      if (!isControlsVisible) {
        overlayWindow.show();
        console.log("Showing overlay window at position:", miniControlPosition);
      } else {
        // Even when controls are visible, we want to hide the overlay window
        // only when we're sure the main window's miniControlBar is visible
        overlayWindow.hide();
        console.log("Hiding overlay window (controls are visible)");
      }
    }
    return true;
  } catch (error) {
    console.error("Error updating mini controls:", error);
    return false;
  }
});

// Handle toggle controls event from the overlay window
ipcMain.on("toggle-controls", () => {
  try {
    if (mainWindow && !mainWindow.isDestroyed()) {
      console.log(
        "Toggle controls received from overlay window, forwarding to main window"
      );
      mainWindow.webContents.send("toggle-controls-from-mini");

      // Toggle the isControlsVisible state since we'll need it for decision making
      isControlsVisible = !isControlsVisible;

      // If we're going to show controls (click-through disabled),
      // we should hide the overlay window after a short delay
      if (isControlsVisible) {
        setTimeout(() => {
          if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
            console.log("Delayed hiding of overlay window after toggle");
          }
        }, 300); // Delay to ensure the main window has processed the toggle
      }
    }
  } catch (error) {
    console.error("Error in toggle-controls handler:", error);
  }
});

// Handle close app event from the overlay window
ipcMain.on("close-app", () => {
  app.quit();
});

ipcMain.handle("set-window-size", (event, width, height) => {
  if (mainWindow) {
    const { width: screenWidth, height: screenHeight } =
      screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setSize(width, height);
    mainWindow.setPosition(
      Math.floor((screenWidth - width) / 2),
      Math.floor((screenHeight - height) / 2)
    );
    return true;
  }
  return false;
});

ipcMain.handle("set-fullscreen-overlay", (event) => {
  if (mainWindow) {
    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    mainWindow.setSize(width, height);
    mainWindow.setPosition(0, 0);
    mainWindow.setAlwaysOnTop(true, "screen-saver");
    return true;
  }
  return false;
});

// Handle application close request
ipcMain.handle("close-app", () => {
  app.quit();
});
