import { app, BrowserWindow, Tray, Menu, ipcMain, BrowserWindowConstructorOptions, desktopCapturer, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import si from 'systeminformation'
import os from 'os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let screenshotInterval: NodeJS.Timeout | null = null
let isScreenshotEnabled = false
let screenshotsDir = ''

declare module 'electron' {
  interface App {
    isQuitting?: boolean
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault()
      mainWindow.hide()
    }
    return false
  })
}

function createTray() {
  const iconPath = path.join(__dirname, '../public/icon.png')
  tray = new Tray(iconPath)
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        mainWindow.show()
      },
    },
    {
      label: 'Refresh System Info',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('refresh-system-info')
        }
      },
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip('System Info Monitor')
  tray.setContextMenu(contextMenu)

  tray.on('click', () => {
    mainWindow.show()
  })
}

async function getSystemInfo() {
  try {
    const [cpu, mem, osInfo, system, networkInterfaces, currentLoad, fsSize] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.system(),
      si.networkInterfaces(),
      si.currentLoad(),
      si.fsSize(),
    ])

    const networkInfo = networkInterfaces.find(iface => !iface.internal && iface.ip4) || networkInterfaces[0]

    return {
      hostname: os.hostname(),
      username: os.userInfo().username,
      platform: os.platform(),
      osType: os.type(),
      osRelease: os.release(),
      osVersion: osInfo.distro + ' ' + osInfo.release,
      arch: os.arch(),
      ipAddress: networkInfo ? networkInfo.ip4 : 'N/A',
      macAddress: networkInfo ? networkInfo.mac : 'N/A',
      cpuModel: cpu.manufacturer + ' ' + cpu.brand,
      cpuCores: cpu.cores,
      cpuSpeed: cpu.speed + ' GHz',
      totalMemory: (mem.total / (1024 ** 3)).toFixed(2) + ' GB',
      freeMemory: (mem.free / (1024 ** 3)).toFixed(2) + ' GB',
      usedMemory: (mem.used / (1024 ** 3)).toFixed(2) + ' GB',
      memoryUsagePercent: ((mem.used / mem.total) * 100).toFixed(2) + '%',
      cpuLoad: currentLoad.currentLoad.toFixed(2) + '%',
      uptime: (os.uptime() / 3600).toFixed(2) + ' hours',
      diskInfo: fsSize.map(disk => ({
        fs: disk.fs,
        type: disk.type,
        size: (disk.size / (1024 ** 3)).toFixed(2) + ' GB',
        used: (disk.used / (1024 ** 3)).toFixed(2) + ' GB',
        available: (disk.available / (1024 ** 3)).toFixed(2) + ' GB',
        usePercent: disk.use.toFixed(2) + '%',
      })),
    }
  } catch (error) {
    console.error('Error getting system info:', error)
    return null
  }
}

async function captureScreenshot() {
  try {
    const sources = await desktopCapturer.getSources({
      types: ['screen'],
      thumbnailSize: screen.getPrimaryDisplay().workAreaSize
    })

    if (sources.length === 0) {
      console.error('No screen sources available')
      return
    }

    const screenshot = sources[0].thumbnail
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `screenshot-${timestamp}.png`
    const filepath = path.join(screenshotsDir, filename)

    fs.writeFileSync(filepath, screenshot.toPNG())
    console.log(`Screenshot saved: ${filepath}`)

    if (mainWindow) {
      mainWindow.webContents.send('screenshot-captured', { filename, filepath })
    }
  } catch (error) {
    console.error('Error capturing screenshot:', error)
  }
}

function startScreenshots(interval: number = 30000) {
  if (screenshotInterval) {
    clearInterval(screenshotInterval)
  }

  screenshotsDir = path.join(app.getPath('pictures'), 'SystemMonitorScreenshots')
  
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true })
  }

  isScreenshotEnabled = true
  captureScreenshot()
  
  screenshotInterval = setInterval(() => {
    captureScreenshot()
  }, interval)

  console.log(`Screenshots started, saving to: ${screenshotsDir}`)
  return { enabled: true, directory: screenshotsDir, interval }
}

function stopScreenshots() {
  if (screenshotInterval) {
    clearInterval(screenshotInterval)
    screenshotInterval = null
  }
  isScreenshotEnabled = false
  console.log('Screenshots stopped')
  return { enabled: false }
}

ipcMain.handle('get-system-info', async () => {
  return await getSystemInfo()
})

ipcMain.handle('start-screenshots', async (event, interval?: number) => {
  return startScreenshots(interval)
})

ipcMain.handle('stop-screenshots', async () => {
  return stopScreenshots()
})

ipcMain.handle('get-screenshot-status', async () => {
  return {
    enabled: isScreenshotEnabled,
    directory: screenshotsDir,
  }
})

ipcMain.handle('open-screenshots-folder', async () => {
  if (screenshotsDir && fs.existsSync(screenshotsDir)) {
    const { shell } = require('electron')
    shell.openPath(screenshotsDir)
  }
})

app.whenReady().then(() => {
  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('before-quit', () => {
  app.isQuitting = true
})
