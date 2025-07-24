# Crosshair Overlay

A customizable desktop crosshair overlay application built with Electron that provides an always-on-top targeting reticle for gaming, design work, or any application where precision pointing is needed.

## Features

- **Customizable Crosshair Types**: Choose between dot or cross reticle designs
- **Full Customization**: Adjust color, opacity, size, thickness, and gap
- **Click-Through Mode**: Use your applications underneath the overlay
- **Miniature Control Bar**: Quick access to key functions even in click-through mode
- **Position Adjustments**: Fine-tune the crosshair position with X/Y offsets
- **Drag Controls**: Move the control panel and mini bar to your preferred position
- **Save Configuration**: Preserve your settings between sessions
- **Always-On-Top**: Never lose sight of your crosshair
- **Keyboard Shortcuts**: Toggle controls with Alt+H for quick hide/show
- **Collapsible Settings**: Organized sections for better space management
- **Visual Notifications**: Non-blocking save confirmations
- **Custom Bar Positioning**: Position the mini control bar anywhere on screen

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Setup

1. Clone this repository:

   ```bash
   git clone https://github.com/edddie7z/crosshair-overlay.git
   ```

2. Navigate to the project directory:

   ```bash
   cd crosshair-overlay
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the application:
   ```bash
   npm start
   ```

## Usage

### Basic Controls

- **Show/Hide Controls**: Click the "Hide Controls & Enable Click-Through" button or use Alt+C
- **Toggle Keyboard Shortcuts**: Use the dedicated button or press Alt+S
- **Move Control Panel**: Drag using the top handle
- **Customize Appearance**: Use the settings in the control panel
- **Mini Control Bar**: Provides access to basic functions when in click-through mode
- **Save Configuration**: Save your settings using the "Save Configuration" button

### Crosshair Types

- **Dot**: A simple circular reticle with adjustable size
- **Cross**: A precision cross with adjustable length, thickness, and gap

### Positioning

- The crosshair is centered by default
- Use X/Y offset controls to fine-tune positioning
- The mini control bar can be placed in preset positions or custom positioned

## Keyboard Shortcuts

- **Alt+H**: Toggle controls visibility and click-through mode (same as the mini button)
- Keyboard shortcuts can be globally enabled/disabled via the settings panel

## Development

This application is built with:

- [Electron](https://www.electronjs.org/)
- HTML/CSS/JavaScript

### Building From Source

1. Clone the repository
2. Install dependencies with `npm install`
3. Run in development mode with `npm start`

### Project Structure

- `main.js`: Electron main process managing windows
- `renderer.js`: UI logic and event handling
- `preload.js`: Secure IPC communication between processes
- `index.html`: Main application UI
- `overlay.html`: Specialized window for mini controls in click-through mode
- `style.css`: Application styling

## License

MIT License - feel free to use and modify for your needs.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Acknowledgements

- [Electron](https://www.electronjs.org/) for making cross-platform desktop apps easy
- Icon assets from [Icons8](https://icons8.com/)
