import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron'

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

export interface ElectronAPI {
  getSystemInfo: () => Promise<SystemInfo | null>
  onRefreshSystemInfo: (callback: (event: IpcRendererEvent) => void) => void
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
})
