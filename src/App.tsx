import { useState, useEffect } from 'react'
import { SystemInfo } from '../electron/preload'

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  useEffect(() => {
    fetchSystemInfo()

    window.electronAPI.onRefreshSystemInfo(() => {
      fetchSystemInfo()
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
