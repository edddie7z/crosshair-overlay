// Cache DOM elements
const controlsPanel = document.getElementById("controlsPanel");
const toggleControlsButton = document.getElementById("toggleControlsButton");

// Mini control bar elements
const miniControlBar = document.getElementById("miniControlBar");
const toggleMenuButton = document.getElementById("toggleMenuButton");
const closeAppButton = document.getElementById("closeAppButton");

// Mini control bar settings elements
const barPositionSelect = document.getElementById("barPosition");
const barOpacityInput = document.getElementById("barOpacity");
const barOpacityValueSpan = document.getElementById("barOpacityValue");
const toggleDragModeButton = document.getElementById("toggleDragModeButton");

// Reticle elements
const reticleDot = document.getElementById("reticleDot");
const reticleCross = document.getElementById("reticleCross");
const crossTop = document.getElementById("crossTop");
const crossRight = document.getElementById("crossRight");
const crossBottom = document.getElementById("crossBottom");
const crossLeft = document.getElementById("crossLeft");

// Reticle settings elements
const reticleTypeSelect = document.getElementById("reticleType");
const reticleColorInput = document.getElementById("reticleColor");
const reticleOpacityInput = document.getElementById("reticleOpacity");
const opacityValueSpan = document.getElementById("opacityValue");

// Dot settings
const dotSizeInput = document.getElementById("dotSize");
const dotSizeValueSpan = document.getElementById("dotSizeValue");
const dotSettings = document.querySelector(".dot-settings");

// Cross settings
const crossLengthInput = document.getElementById("crossLength");
const crossThicknessInput = document.getElementById("crossThickness");
const crossGapInput = document.getElementById("crossGap");
const crossLengthValueSpan = document.getElementById("crossLengthValue");
const crossThicknessValueSpan = document.getElementById("crossThicknessValue");
const crossGapValueSpan = document.getElementById("crossGapValue");
const crossSettings = document.querySelector(".cross-settings");

// Position adjustment elements
const offsetXInput = document.getElementById("offsetX");
const offsetYInput = document.getElementById("offsetY");
const offsetXValueSpan = document.getElementById("offsetXValue");
const offsetYValueSpan = document.getElementById("offsetYValue");

// Application state
let isControlsVisible = true;
let isFullscreen = true; // Always in fullscreen mode
let isDragModeActive = false;
const initialWindowSize = 300;

// Configuration object
let currentConfig = {
  reticleType: "dot",
  color: "#00ff00",
  opacity: 1.0,
  dotSize: 10,
  crossLength: 15,
  crossThickness: 2,
  crossGap: 5,
  offsetX: 0,
  offsetY: 0,
  barPosition: "top-right",
  barOpacity: 0.5,
  barCustomX: 20, // Initial x position if using custom positioning
  barCustomY: 20, // Initial y position if using custom positioning
};

// Initial configuration
window.addEventListener("DOMContentLoaded", () => {
  // Load saved configuration if it exists
  loadConfig();

  // Set initial values
  updateReticle();

  // Set initial mini control bar state
  updateMiniControlBar();

  // Set up event listeners
  setupEventListeners();

  // Set up keyboard shortcuts
  setupKeyboardShortcuts();

  // Set up collapsible sections
  setupCollapsibleSections();

  // Set up window resize listener
  window.addEventListener("resize", handleWindowResize);

  // Register a listener for toggle controls from the overlay window
  if (
    window.electronAPI &&
    typeof window.electronAPI.onToggleControlsFromMini === "function"
  ) {
    window.electronAPI.onToggleControlsFromMini(() => {
      console.log("Toggle controls triggered from overlay");
      toggleControls();
    });
  }
});

// Handle window resize
function handleWindowResize() {
  // If we're in click-through mode, update the region
  if (!isControlsVisible) {
    updateMiniControlRegion();
  }
}

// Save current configuration to localStorage
function saveConfig() {
  try {
    // Create a clean copy of the current configuration to avoid any reference issues
    const configToSave = JSON.parse(JSON.stringify(currentConfig));

    // Save to localStorage
    localStorage.setItem("crosshairConfig", JSON.stringify(configToSave));

    console.log("Configuration successfully saved to localStorage");
    return true;
  } catch (error) {
    console.error("Error saving configuration:", error);
    return false;
  }
}

// Load configuration from localStorage
function loadConfig() {
  const savedConfig = localStorage.getItem("crosshairConfig");

  if (savedConfig) {
    try {
      currentConfig = JSON.parse(savedConfig);

      // Update UI elements to match loaded config
      reticleTypeSelect.value = currentConfig.reticleType;
      reticleColorInput.value = currentConfig.color;
      reticleOpacityInput.value = currentConfig.opacity;
      opacityValueSpan.textContent = currentConfig.opacity;

      dotSizeInput.value = currentConfig.dotSize;
      dotSizeValueSpan.textContent = currentConfig.dotSize;

      crossLengthInput.value = currentConfig.crossLength;
      crossLengthValueSpan.textContent = currentConfig.crossLength;

      crossThicknessInput.value = currentConfig.crossThickness;
      crossThicknessValueSpan.textContent = currentConfig.crossThickness;

      crossGapInput.value = currentConfig.crossGap;
      crossGapValueSpan.textContent = currentConfig.crossGap;

      // Handle position adjustments
      if (currentConfig.hasOwnProperty("offsetX")) {
        offsetXInput.value = currentConfig.offsetX;
        offsetXValueSpan.textContent = currentConfig.offsetX;
      }

      if (currentConfig.hasOwnProperty("offsetY")) {
        offsetYInput.value = currentConfig.offsetY;
        offsetYValueSpan.textContent = currentConfig.offsetY;
      } // Handle mini control bar position and opacity
      barPositionSelect.value = currentConfig.barPosition;
      barOpacityInput.value = currentConfig.barOpacity;
      barOpacityValueSpan.textContent = currentConfig.barOpacity;

      // Ensure we have custom position values if needed
      if (
        currentConfig.barPosition === "custom" &&
        (!currentConfig.hasOwnProperty("barCustomX") ||
          !currentConfig.hasOwnProperty("barCustomY"))
      ) {
        currentConfig.barCustomX = 20;
        currentConfig.barCustomY = 20;
      }

      // Show/hide appropriate settings
      if (currentConfig.reticleType === "dot") {
        dotSettings.classList.remove("hidden");
        crossSettings.classList.add("hidden");
        reticleDot.style.display = "block";
        reticleCross.style.display = "none";
      } else {
        dotSettings.classList.add("hidden");
        crossSettings.classList.remove("hidden");
        reticleDot.style.display = "none";
        reticleCross.style.display = "block";
      }
    } catch (err) {
      console.error("Error loading saved configuration:", err);
      // Use default config if there's an error
    }
  }
}

// Setup keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener("keydown", handleKeyboardShortcuts);
}

// Handle keyboard shortcuts
function handleKeyboardShortcuts(e) {
  // Only respond to shortcuts if they're enabled
  if (!keyboardShortcutsEnabled) return;

  // Alt+H to hide/unhide menu
  if (e.altKey && e.key === "h") {
    toggleControls();
  }
}

// Set up all event listeners
function setupEventListeners() {
  // Reticle type change
  reticleTypeSelect.addEventListener("change", handleReticleTypeChange);

  // Color and opacity changes
  reticleColorInput.addEventListener("input", updateReticle);
  reticleOpacityInput.addEventListener("input", (e) => {
    opacityValueSpan.textContent = e.target.value;
    updateReticle();
  });

  // Dot size change
  dotSizeInput.addEventListener("input", (e) => {
    dotSizeValueSpan.textContent = e.target.value;
    updateReticle();
  });

  // Cross settings changes
  crossLengthInput.addEventListener("input", (e) => {
    crossLengthValueSpan.textContent = e.target.value;
    updateReticle();
  });

  crossThicknessInput.addEventListener("input", (e) => {
    crossThicknessValueSpan.textContent = e.target.value;
    updateReticle();
  });

  crossGapInput.addEventListener("input", (e) => {
    crossGapValueSpan.textContent = e.target.value;
    updateReticle();
  });

  // Position adjustment changes
  offsetXInput.addEventListener("input", (e) => {
    offsetXValueSpan.textContent = e.target.value;
    updateReticle();
  });

  offsetYInput.addEventListener("input", (e) => {
    offsetYValueSpan.textContent = e.target.value;
    updateReticle();
  });
  // Mini control bar position and opacity changes
  barPositionSelect.addEventListener("change", (e) => {
    currentConfig.barPosition = e.target.value;

    // If switching away from custom position, disable drag mode
    if (e.target.value !== "custom" && isDragModeActive) {
      toggleDragMode();
    }

    updateMiniControlBar();
  });

  barOpacityInput.addEventListener("input", (e) => {
    barOpacityValueSpan.textContent = e.target.value;
    currentConfig.barOpacity = e.target.value;
    updateMiniControlBar();
  });

  // Drag mode toggle button
  toggleDragModeButton.addEventListener("click", toggleDragMode);
  // Toggle controls visibility and click-through
  toggleControlsButton.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleControls();
  });

  // Mini control bar buttons
  toggleMenuButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    // Ensure we can toggle even if toggling is in progress
    window.isTogglingInProgress = false;
    toggleControls();
  });
  closeAppButton.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    window.electronAPI.closeApp();
  });

  // Ensure mini control bar buttons are clickable
  miniControlBar.style.pointerEvents = "auto";
  // Add save button event listener
  const saveButton = document.getElementById("saveConfigButton");
  if (saveButton) {
    saveButton.addEventListener("click", () => {
      try {
        // Save the current configuration
        saveConfig();

        // Show a non-blocking notification instead of an alert that interrupts the app
        const notification = document.createElement("div");
        notification.className = "save-notification";
        notification.textContent = "Configuration saved!";
        document.body.appendChild(notification);

        // Remove the notification after 2 seconds
        setTimeout(() => {
          if (notification && notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 2000);

        // Make sure the reticle is still visible
        document.querySelector(".reticle-container").style.display = "flex";

        // Ensure the mini control bar is properly updated
        updateMiniControlBar();

        // If we are in click-through mode, ensure the overlay window is updated
        if (!isControlsVisible) {
          updateMiniControlRegion();
        }
      } catch (error) {
        console.error("Error saving configuration:", error);
        alert("Error saving configuration. Please try again.");
      }
    });
  }

  // Drag mode toggle
  toggleDragModeButton.addEventListener("click", toggleDragMode); // Keyboard shortcuts toggle switch
  const shortcutsEnabledToggle = document.getElementById("shortcutsEnabled");
  if (shortcutsEnabledToggle) {
    // Set initial state of the checkbox to match current state
    shortcutsEnabledToggle.checked = keyboardShortcutsEnabled;

    shortcutsEnabledToggle.addEventListener("change", function () {
      // Update the state based on checkbox and handle keyboard shortcuts
      keyboardShortcutsEnabled = this.checked;

      if (keyboardShortcutsEnabled) {
        // Re-enable keyboard shortcuts
        document.addEventListener("keydown", handleKeyboardShortcuts);
        console.log("Keyboard shortcuts enabled");
      } else {
        // Disable keyboard shortcuts
        document.removeEventListener("keydown", handleKeyboardShortcuts);
        console.log("Keyboard shortcuts disabled");
      }
    });
  }

  // Panel dragging
  const controlsPanelHandle = document.getElementById("controlsPanelHandle");
  if (controlsPanelHandle) {
    controlsPanelHandle.addEventListener("mousedown", startDragControlsPanel);
  }
}

// Handle reticle type change
function handleReticleTypeChange() {
  const reticleType = reticleTypeSelect.value;

  if (reticleType === "dot") {
    // Show dot, hide cross
    dotSettings.classList.remove("hidden");
    crossSettings.classList.add("hidden");
    reticleDot.style.display = "block";
    reticleCross.style.display = "none";
  } else {
    // Show cross, hide dot
    dotSettings.classList.add("hidden");
    crossSettings.classList.remove("hidden");
    reticleDot.style.display = "none";
    reticleCross.style.display = "block";
  }

  updateReticle();
}

// Update reticle appearance based on current settings
function updateReticle() {
  const color = reticleColorInput.value;
  const opacity = reticleOpacityInput.value;
  // Update current configuration
  currentConfig.reticleType = reticleTypeSelect.value;
  currentConfig.color = color;
  currentConfig.opacity = opacity;
  currentConfig.dotSize = parseInt(dotSizeInput.value);
  currentConfig.crossLength = parseInt(crossLengthInput.value);
  currentConfig.crossThickness = parseInt(crossThicknessInput.value);
  currentConfig.crossGap = parseInt(crossGapInput.value);
  currentConfig.offsetX = parseInt(offsetXInput.value);
  currentConfig.offsetY = parseInt(offsetYInput.value);
  currentConfig.barPosition = barPositionSelect.value;
  currentConfig.barOpacity = parseFloat(barOpacityInput.value);

  // Apply color and opacity to all reticle elements
  reticleDot.style.backgroundColor = color;
  reticleDot.style.opacity = opacity;

  const crossElements = document.querySelectorAll(".cross-line");
  crossElements.forEach((el) => {
    el.style.backgroundColor = color;
    el.style.opacity = opacity;
  });

  // Apply dot-specific settings
  const dotSize = currentConfig.dotSize;
  reticleDot.style.width = `${dotSize}px`;
  reticleDot.style.height = `${dotSize}px`;

  // Apply cross-specific settings
  const crossLength = currentConfig.crossLength;
  const crossThickness = currentConfig.crossThickness;
  const crossGap = currentConfig.crossGap;

  // Calculate positions
  const halfThickness = Math.floor(crossThickness / 2);

  // Top line
  crossTop.style.width = `${crossThickness}px`;
  crossTop.style.height = `${crossLength}px`;
  crossTop.style.left = `${-halfThickness}px`;
  crossTop.style.top = `${-(crossLength + crossGap)}px`;

  // Right line
  crossRight.style.width = `${crossLength}px`;
  crossRight.style.height = `${crossThickness}px`;
  crossRight.style.top = `${-halfThickness}px`;
  crossRight.style.left = `${crossGap}px`;

  // Bottom line
  crossBottom.style.width = `${crossThickness}px`;
  crossBottom.style.height = `${crossLength}px`;
  crossBottom.style.left = `${-halfThickness}px`;
  crossBottom.style.top = `${crossGap}px`;

  // Left line
  crossLeft.style.width = `${crossLength}px`;
  crossLeft.style.height = `${crossThickness}px`;
  crossLeft.style.top = `${-halfThickness}px`;
  crossLeft.style.left = `${-(crossLength + crossGap)}px`;

  // Apply position adjustments
  const offsetX = currentConfig.offsetX;
  const offsetY = currentConfig.offsetY;
  const reticleContainer = document.querySelector(".reticle-container");

  reticleContainer.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
}

// Update mini control bar position and opacity
function updateMiniControlBar() {
  const miniControlBar = document.getElementById("miniControlBar");
  const barPosition = currentConfig.barPosition;
  const barOpacity = currentConfig.barOpacity;

  // Set opacity
  miniControlBar.style.opacity = barOpacity;

  // Set position
  switch (barPosition) {
    case "top-left":
      miniControlBar.style.top = "10px";
      miniControlBar.style.left = "10px";
      miniControlBar.style.right = "auto";
      miniControlBar.style.bottom = "auto";
      break;
    case "top-right":
      miniControlBar.style.top = "10px";
      miniControlBar.style.right = "10px";
      miniControlBar.style.left = "auto";
      miniControlBar.style.bottom = "auto";
      break;
    case "bottom-left":
      miniControlBar.style.bottom = "10px";
      miniControlBar.style.left = "10px";
      miniControlBar.style.right = "auto";
      miniControlBar.style.top = "auto";
      break;
    case "bottom-right":
      miniControlBar.style.bottom = "10px";
      miniControlBar.style.right = "10px";
      miniControlBar.style.left = "auto";
      miniControlBar.style.top = "auto";
      break;
    case "custom":
      miniControlBar.style.top = currentConfig.barCustomY + "px";
      miniControlBar.style.left = currentConfig.barCustomX + "px";
      miniControlBar.style.right = "auto";
      miniControlBar.style.bottom = "auto";
      break;
    default:
      miniControlBar.style.top = "10px";
      miniControlBar.style.right = "10px";
      miniControlBar.style.left = "auto";
      miniControlBar.style.bottom = "auto";
      break;
  }
}

// Update the overlay window with mini control bar position
async function updateMiniControlRegion() {
  try {
    // Get the current bounds of the mini control bar
    const rect = miniControlBar.getBoundingClientRect();
    const bounds = {
      x: rect.left,
      y: rect.top,
      width: rect.width,
      height: rect.height,
      opacity: currentConfig.barOpacity || 0.8,
    };

    if (!isControlsVisible) {
      // Update mini controls in the overlay window
      await window.electronAPI.updateMiniControls(bounds);

      // Hide the mini control bar in the main window when in click-through mode
      // as we'll show it in the overlay window instead
      miniControlBar.style.visibility = "hidden";

      console.log(
        "Mini control bar position updated in overlay window:",
        bounds
      );
    } else {
      // Show the mini control bar in the main window when not in click-through mode
      miniControlBar.style.visibility = "visible";

      // Still update the overlay window with the position in case we need to toggle later
      await window.electronAPI.updateMiniControls(bounds);
    }
    return true;
  } catch (error) {
    console.error("Error updating mini control region:", error);
    return false;
  }
}

// Toggle controls panel visibility and click-through
async function toggleControls() {
  // Add a guard to prevent rapid toggling that might cause race conditions
  if (window.isTogglingInProgress) {
    console.log("Toggle already in progress, ignoring request");
    return;
  }

  window.isTogglingInProgress = true;

  try {
    isControlsVisible = !isControlsVisible;
    console.log(
      `Toggling controls. New state: ${
        isControlsVisible ? "visible" : "hidden"
      }`
    );

    if (isControlsVisible) {
      // Show controls
      controlsPanel.classList.remove("hidden");
      toggleControlsButton.textContent = "Hide Controls & Enable Click-Through";
      toggleMenuButton.textContent = "☰";
      document.body.classList.remove("click-through-enabled");

      // Make sure the reticle is visible
      document.querySelector(".reticle-container").style.display = "flex";

      // Disable click-through mode first to ensure we can interact with UI
      await window.electronAPI.toggleMouseEvents(false);

      // Make mini control bar visible in the main window
      miniControlBar.style.visibility = "visible";

      console.log("Controls shown, click-through disabled");
    } else {
      // Hide controls
      controlsPanel.classList.add("hidden");
      toggleControlsButton.textContent =
        "Show Controls & Disable Click-Through";
      toggleMenuButton.textContent = "◱";

      // Disable drag mode when hiding controls
      if (isDragModeActive) {
        toggleDragMode();
      }

      // Add visual indicator that click-through is enabled
      document.body.classList.add("click-through-enabled");

      // Make sure the reticle is visible
      document.querySelector(".reticle-container").style.display = "flex"; // Update the overlay window with position information before enabling click-through
      // This is critical for ensuring the mini controls remain visible
      try {
        console.log(
          "Updating mini control region before enabling click-through"
        );
        await updateMiniControlRegion();
      } catch (error) {
        console.error("Error updating mini control region:", error);
      }

      // Enable click-through mode last
      console.log("Controls hidden, enabling click-through");
      await window.electronAPI.toggleMouseEvents(true);

      // Make a final check to ensure the overlay window is properly updated with the position
      setTimeout(async () => {
        try {
          await updateMiniControlRegion();
        } catch (error) {
          console.error("Error in delayed updateMiniControlRegion:", error);
        }
      }, 100);
    }
  } catch (error) {
    console.error("Error in toggleControls:", error);
    // Try to recover to a known good state
    document.body.classList.remove("click-through-enabled");
    controlsPanel.classList.remove("hidden");
    await window.electronAPI.toggleMouseEvents(false);
  } finally {
    // Always clear the in-progress flag
    window.isTogglingInProgress = false;
  }
}

// Toggle drag mode for mini control bar
function toggleDragMode() {
  isDragModeActive = !isDragModeActive;

  if (isDragModeActive) {
    // Activate drag mode
    miniControlBar.classList.add("draggable");
    toggleDragModeButton.textContent = "Disable Drag Mode";
    toggleDragModeButton.classList.add("active");

    // If not already in custom position mode, switch to it
    if (currentConfig.barPosition !== "custom") {
      // Save current position before switching to custom
      const rect = miniControlBar.getBoundingClientRect();
      currentConfig.barCustomX = rect.left;
      currentConfig.barCustomY = rect.top;
      barPositionSelect.value = "custom";
      currentConfig.barPosition = "custom";
    }

    // Enable dragging
    miniControlBar.onmousedown = dragMouseDown;
  } else {
    // Deactivate drag mode
    miniControlBar.classList.remove("draggable");
    toggleDragModeButton.textContent = "Enable Drag Mode";
    toggleDragModeButton.classList.remove("active");

    // Disable dragging
    miniControlBar.onmousedown = null;
  }
}

// Drag functionality
function dragMouseDown(e) {
  e = e || window.event;
  e.preventDefault();

  // Get the initial mouse cursor position
  const initialX = e.clientX;
  const initialY = e.clientY;

  // Get the initial element position
  const rect = miniControlBar.getBoundingClientRect();
  const initialLeft = rect.left;
  const initialTop = rect.top;

  // Add event listeners for mousemove and mouseup
  document.onmousemove = function (e) {
    e = e || window.event;
    e.preventDefault();

    // Calculate the new position
    const newLeft = initialLeft + (e.clientX - initialX);
    const newTop = initialTop + (e.clientY - initialY);

    // Update the element position
    miniControlBar.style.left = newLeft + "px";
    miniControlBar.style.top = newTop + "px";
    miniControlBar.style.right = "auto";
    miniControlBar.style.bottom = "auto"; // Update the configuration
    currentConfig.barCustomX = newLeft;
    currentConfig.barCustomY = newTop;

    // If we're in click-through mode, update the region
    if (!isControlsVisible) {
      updateMiniControlRegion();
    }
  };

  // Stop moving when mouse button is released
  document.onmouseup = function () {
    document.onmousemove = null;
    document.onmouseup = null;
  };
}

// Controls panel dragging functionality
function startDragControlsPanel(e) {
  e = e || window.event;
  e.preventDefault();

  // Only allow dragging when using the handle
  if (e.target.id !== "controlsPanelHandle") return;

  // Get the initial mouse cursor position
  const initialX = e.clientX;
  const initialY = e.clientY;

  // Get the initial panel position
  const rect = controlsPanel.getBoundingClientRect();
  const initialLeft = rect.left;
  const initialTop = rect.top;

  // Add visual feedback
  controlsPanel.classList.add("draggable");

  // Add event listeners for mousemove and mouseup
  document.onmousemove = function (e) {
    e = e || window.event;
    e.preventDefault();

    // Calculate the new position
    const newLeft = initialLeft + (e.clientX - initialX);
    const newTop = initialTop + (e.clientY - initialY);

    // Ensure panel stays within viewport
    const maxLeft = window.innerWidth - rect.width;
    const maxTop = window.innerHeight - rect.height;

    const boundedLeft = Math.max(0, Math.min(newLeft, maxLeft));
    const boundedTop = Math.max(0, Math.min(newTop, maxTop));

    // Update panel position
    controlsPanel.style.left = boundedLeft + "px";
    controlsPanel.style.bottom = "auto";
    controlsPanel.style.top = boundedTop + "px";
    controlsPanel.style.transform = "none";
  };

  document.onmouseup = function () {
    // Remove event listeners
    document.onmousemove = null;
    document.onmouseup = null;

    // Remove visual feedback
    controlsPanel.classList.remove("draggable");
  };
}

// Add state variable for keyboard shortcuts
let keyboardShortcutsEnabled = true;

// Implementation of keyboard shortcuts toggle
function toggleKeyboardShortcuts() {
  keyboardShortcutsEnabled = !keyboardShortcutsEnabled;
  const shortcutsEnabledToggle = document.getElementById("shortcutsEnabled");

  if (shortcutsEnabledToggle) {
    // Update the checkbox to match the current state
    shortcutsEnabledToggle.checked = keyboardShortcutsEnabled;

    // Trigger the "change" event to ensure consistent behavior
    const event = new Event("change");
    shortcutsEnabledToggle.dispatchEvent(event);
  } else {
    // If the toggle doesn't exist, handle the events directly
    if (keyboardShortcutsEnabled) {
      document.addEventListener("keydown", handleKeyboardShortcuts);
      console.log("Keyboard shortcuts enabled via hotkey");
    } else {
      document.removeEventListener("keydown", handleKeyboardShortcuts);
      console.log("Keyboard shortcuts disabled via hotkey");
    }
  }
}

// Setup collapsible sections
function setupCollapsibleSections() {
  const sectionHeaders = document.querySelectorAll(".section-header");

  sectionHeaders.forEach((header) => {
    header.addEventListener("click", () => {
      const targetId = header.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      const toggleIcon = header.querySelector(".toggle-icon");

      if (targetContent) {
        targetContent.classList.toggle("collapsed");

        // Update the toggle icon
        if (toggleIcon) {
          if (targetContent.classList.contains("collapsed")) {
            toggleIcon.textContent = "▶";
          } else {
            toggleIcon.textContent = "▼";
          }
        }
      }
    });
  });

  // Initialize sections - collapse all except the first one
  let isFirst = true;

  sectionHeaders.forEach((header) => {
    const targetId = header.getAttribute("data-target");
    const targetContent = document.getElementById(targetId);
    const toggleIcon = header.querySelector(".toggle-icon");

    if (targetContent) {
      if (isFirst) {
        // Keep first section expanded
        targetContent.classList.remove("collapsed");
        if (toggleIcon) {
          toggleIcon.textContent = "▼";
        }
        isFirst = false;
      } else {
        // Collapse other sections
        targetContent.classList.add("collapsed");
        if (toggleIcon) {
          toggleIcon.textContent = "▶";
        }
      }
    }
  });
}
