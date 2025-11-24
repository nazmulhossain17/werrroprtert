import { useState, useEffect } from 'react'
import type { SystemInfo } from '../electron/preload'

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [screenshotEnabled, setScreenshotEnabled] = useState(false)
  const [screenshotDirectory, setScreenshotDirectory] = useState<string>('')
  const [screenshotCount, setScreenshotCount] = useState(0)

  const fetchSystemInfo = async () => {
    setLoading(true)
    setError(null)
    try {
      const info = await window.electronAPI.getSystemInfo()
      if (info) {
        setSystemInfo(info)
      } else {
        setError('Failed to fetch system information')
      }
    } catch (err) {
      setError('Error fetching system information: ' + (err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const fetchScreenshotStatus = async () => {
    try {
      const status = await window.electronAPI.getScreenshotStatus()
      setScreenshotEnabled(status.enabled)
      if (status.directory) {
        setScreenshotDirectory(status.directory)
      }
    } catch (err) {
      console.error('Error fetching screenshot status:', err)
    }
  }

  const handleStartScreenshots = async () => {
    try {
      const result = await window.electronAPI.startScreenshots(30000)
      setScreenshotEnabled(result.enabled)
      if (result.directory) {
        setScreenshotDirectory(result.directory)
      }
    } catch (err) {
      console.error('Error starting screenshots:', err)
    }
  }

  const handleStopScreenshots = async () => {
    try {
      const result = await window.electronAPI.stopScreenshots()
      setScreenshotEnabled(result.enabled)
    } catch (err) {
      console.error('Error stopping screenshots:', err)
    }
  }

  const handleOpenScreenshotsFolder = async () => {
    try {
      await window.electronAPI.openScreenshotsFolder()
    } catch (err) {
      console.error('Error opening screenshots folder:', err)
    }
  }

  useEffect(() => {
    fetchSystemInfo()

    if (!window.electronAPI) {
      console.warn('electronAPI is not available - preload script may have failed to load')
      return
    }

    fetchScreenshotStatus()

    window.electronAPI.onRefreshSystemInfo(() => {
      fetchSystemInfo()
    })

    window.electronAPI.onScreenshotCaptured(() => {
      setScreenshotCount(prev => prev + 1)
    })
  }, [])

  if (loading) {
    return (
      <div className="app">
        <div className="loading">Loading system information...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
        </div>
        <button className="refresh-button" onClick={fetchSystemInfo}>
          Retry
        </button>
      </div>
    )
  }

  if (!systemInfo) {
    return (
      <div className="app">
        <div className="error">No system information available</div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>System Information Monitor</h1>
        <p>Real-time system monitoring and information</p>
      </div>

      <button className="refresh-button" onClick={fetchSystemInfo}>
        Refresh System Info
      </button>

      <div className="info-card screenshot-section" style={{ marginBottom: '20px' }}>
        <h2>Automatic Screenshots</h2>
        <p style={{ marginBottom: '15px', color: '#666' }}>
          Capture screenshots automatically every 30 seconds
        </p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {!screenshotEnabled ? (
            <button 
              className="refresh-button" 
              onClick={handleStartScreenshots}
              style={{ margin: 0 }}
            >
              Start Screenshots
            </button>
          ) : (
            <button 
              className="refresh-button" 
              onClick={handleStopScreenshots}
              style={{ margin: 0, background: '#ff6b6b' }}
            >
              Stop Screenshots
            </button>
          )}
          {screenshotDirectory && (
            <button 
              className="refresh-button" 
              onClick={handleOpenScreenshotsFolder}
              style={{ margin: 0, background: '#51cf66' }}
            >
              Open Folder
            </button>
          )}
        </div>
        {screenshotEnabled && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '8px' }}>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value" style={{ color: '#51cf66', fontWeight: 'bold' }}>Active</span>
            </div>
            <div className="info-item">
              <span className="info-label">Interval:</span>
              <span className="info-value">30 seconds</span>
            </div>
            <div className="info-item">
              <span className="info-label">Screenshots Captured:</span>
              <span className="info-value">{screenshotCount}</span>
            </div>
            {screenshotDirectory && (
              <div className="info-item">
                <span className="info-label">Save Location:</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>{screenshotDirectory}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-grid">
        <div className="info-card">
          <h2>System Identity</h2>
          <div className="info-item">
            <span className="info-label">Hostname:</span>
            <span className="info-value">{systemInfo.hostname}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Username:</span>
            <span className="info-value">{systemInfo.username}</span>
          </div>
          <div className="info-item">
            <span className="info-label">IP Address:</span>
            <span className="info-value">{systemInfo.ipAddress}</span>
          </div>
          <div className="info-item">
            <span className="info-label">MAC Address:</span>
            <span className="info-value">{systemInfo.macAddress}</span>
          </div>
        </div>

        <div className="info-card">
          <h2>Operating System</h2>
          <div className="info-item">
            <span className="info-label">OS Type:</span>
            <span className="info-value">{systemInfo.osType}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Platform:</span>
            <span className="info-value">{systemInfo.platform}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">{systemInfo.osVersion}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Release:</span>
            <span className="info-value">{systemInfo.osRelease}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Architecture:</span>
            <span className="info-value">{systemInfo.arch}</span>
          </div>
        </div>

        <div className="info-card">
          <h2>CPU Information</h2>
          <div className="info-item">
            <span className="info-label">Model:</span>
            <span className="info-value">{systemInfo.cpuModel}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Cores:</span>
            <span className="info-value">{systemInfo.cpuCores}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Speed:</span>
            <span className="info-value">{systemInfo.cpuSpeed}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Current Load:</span>
            <span className="info-value">{systemInfo.cpuLoad}</span>
          </div>
        </div>

        <div className="info-card">
          <h2>Memory Information</h2>
          <div className="info-item">
            <span className="info-label">Total Memory:</span>
            <span className="info-value">{systemInfo.totalMemory}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Used Memory:</span>
            <span className="info-value">{systemInfo.usedMemory}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Free Memory:</span>
            <span className="info-value">{systemInfo.freeMemory}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Usage:</span>
            <span className="info-value">{systemInfo.memoryUsagePercent}</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: systemInfo.memoryUsagePercent }}
            />
          </div>
        </div>

        <div className="info-card">
          <h2>System Health</h2>
          <div className="info-item">
            <span className="info-label">Uptime:</span>
            <span className="info-value">{systemInfo.uptime}</span>
          </div>
          <div className="info-item">
            <span className="info-label">CPU Load:</span>
            <span className="info-value">{systemInfo.cpuLoad}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Memory Usage:</span>
            <span className="info-value">{systemInfo.memoryUsagePercent}</span>
          </div>
        </div>

        <div className="info-card disk-section">
          <h2>Disk Information</h2>
          <div className="disk-grid">
            {systemInfo.diskInfo.map((disk, index) => (
              <div key={index} className="disk-card">
                <h3>{disk.fs}</h3>
                <div className="info-item">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{disk.type}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Size:</span>
                  <span className="info-value">{disk.size}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Used:</span>
                  <span className="info-value">{disk.used}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Available:</span>
                  <span className="info-value">{disk.available}</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: disk.usePercent }}
                  />
                </div>
                <div style={{ textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>
                  {disk.usePercent} Used
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
