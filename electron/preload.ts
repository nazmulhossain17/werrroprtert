const { contextBridge, ipcRenderer } = require('electron')
import type { IpcRendererEvent } from 'electron'

export interface SystemInfo {
  hostname: string
  username: string
  platform: string
  osType: string
  osRelease: string
  osVersion: string
  arch: string
  ipAddress: string
  macAddress: string
  cpuModel: string
  cpuCores: number
  cpuSpeed: string
  totalMemory: string
  freeMemory: string
  usedMemory: string
  memoryUsagePercent: string
  cpuLoad: string
  uptime: string
  diskInfo: Array<{
    fs: string
    type: string
    size: string
    used: string
    available: string
    usePercent: string
  }>
}

export interface ScreenshotStatus {
  enabled: boolean
  directory?: string
  interval?: number
}

export interface ScreenshotCaptured {
  filename: string
  filepath: string
}

export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo | null>
  onRefreshSystemInfo: (callback: (event: IpcRendererEvent) => void) => void
  startScreenshots: (interval?: number) => Promise<ScreenshotStatus>
  stopScreenshots: () => Promise<ScreenshotStatus>
  getScreenshotStatus: () => Promise<ScreenshotStatus>
  openScreenshotsFolder: () => Promise<void>
  onScreenshotCaptured: (callback: (event: IpcRendererEvent, data: ScreenshotCaptured) => void) => void
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

contextBridge.exposeInMainWorld('electronAPI', {
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  onRefreshSystemInfo: (callback: (event: IpcRendererEvent) => void) => 
    ipcRenderer.on('refresh-system-info', callback),
  startScreenshots: (interval?: number) => ipcRenderer.invoke('start-screenshots', interval),
  stopScreenshots: () => ipcRenderer.invoke('stop-screenshots'),
  getScreenshotStatus: () => ipcRenderer.invoke('get-screenshot-status'),
  openScreenshotsFolder: () => ipcRenderer.invoke('open-screenshots-folder'),
  onScreenshotCaptured: (callback: (event: IpcRendererEvent, data: ScreenshotCaptured) => void) =>
    ipcRenderer.on('screenshot-captured', callback),
})
