const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Toggle mouse events (click-through functionality)
  toggleMouseEvents: async (ignore) => {
    try {
      return await ipcRenderer.invoke("toggle-mouse-events", ignore);
    } catch (error) {
      console.error("Error invoking toggle-mouse-events:", error);
      return false;
    }
  },

  // Update mini controls window position
  updateMiniControls: async (bounds) => {
    try {
      return await ipcRenderer.invoke("update-mini-controls", bounds);
    } catch (error) {
      console.error("Error invoking update-mini-controls:", error);
      return false;
    }
  },

  // Set window size
  setWindowSize: async (width, height) => {
    try {
      return await ipcRenderer.invoke("set-window-size", width, height);
    } catch (error) {
      console.error("Error invoking set-window-size:", error);
      return false;
    }
  },

  // Set fullscreen overlay
  setFullscreenOverlay: async () => {
    try {
      return await ipcRenderer.invoke("set-fullscreen-overlay");
    } catch (error) {
      console.error("Error invoking set-fullscreen-overlay:", error);
      return false;
    }
  },

  // Close the application
  closeApp: async () => {
    try {
      return await ipcRenderer.invoke("close-app");
    } catch (error) {
      console.error("Error invoking close-app:", error);
      return false;
    }
  },

  // Listen for toggle controls from mini bar
  onToggleControlsFromMini: (callback) => {
    const safeCallback = () => {
      try {
        callback();
      } catch (error) {
        console.error("Error in toggle-controls-from-mini callback:", error);
      }
    };

    // Remove any existing listeners to prevent duplicates
    ipcRenderer.removeAllListeners("toggle-controls-from-mini");

    // Add the new listener
    ipcRenderer.on("toggle-controls-from-mini", safeCallback);
    console.log("Toggle controls listener registered");

    // Return cleanup function
    return () => {
      ipcRenderer.removeListener("toggle-controls-from-mini", safeCallback);
    };
  },
});
