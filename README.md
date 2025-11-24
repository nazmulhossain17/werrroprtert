# System Information Monitor

A modern Electron desktop application built with Vite, React, and TypeScript that displays comprehensive system information including hostname, IP address, username, OS details, and system health metrics.

## Features

- **Real-time System Information**: View detailed information about your system including:
  - System Identity (hostname, username, IP address, MAC address)
  - Operating System details (OS type, platform, version, architecture)
  - CPU Information (model, cores, speed, current load)
  - Memory Information (total, used, free, usage percentage)
  - System Health (uptime, CPU load, memory usage)
  - Disk Information (filesystem, size, used space, available space)

- **Background Running**: The application runs in the system tray and continues running in the background when closed
- **System Tray Integration**: Access the app quickly from the system tray with options to show, refresh, or quit
- **Modern UI**: Beautiful gradient interface with responsive cards and real-time data visualization
- **TypeScript**: Fully typed codebase for better development experience and code quality

## Tech Stack

- **Electron**: Latest version for cross-platform desktop application
- **Vite**: Fast build tool and development server
- **React**: Modern UI library with hooks
- **TypeScript**: Type-safe development
- **systeminformation**: Comprehensive system information library

## Installation

1. Clone the repository:
```bash
git clone https://github.com/nazmulhossain17/werrroprtert.git
cd werrroprtert
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the application in development mode:

```bash
npm run dev
```

This will start the Vite development server and launch the Electron application with hot-reload enabled.

## Building

Build the application for production:

```bash
npm run build
```

Build the Electron application with electron-builder:

```bash
npm run electron:build
```

## Usage

1. Launch the application
2. The system information will be automatically loaded and displayed
3. Click the "Refresh System Info" button to update the information
4. Close the window to minimize the app to the system tray
5. Right-click the system tray icon to access app options:
   - **Show App**: Bring the application window back
   - **Refresh System Info**: Update system information
   - **Quit**: Exit the application completely

## System Tray

The application runs in the background and can be accessed from the system tray. When you close the main window, the app continues running in the background. You can:

- Click the tray icon to show the application window
- Right-click the tray icon to access the context menu
- Select "Quit" from the context menu to completely exit the application

## License

ISC

## Author

builtforyou.xyz@gmail.com
