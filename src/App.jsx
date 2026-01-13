import { useState, useEffect, useCallback } from 'react'
import './App.css'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Players from './pages/Players'
import Bans from './pages/Bans'
import Settings from './pages/Settings'
import useWebSocket from './hooks/useWebSocket'

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const { state, isConnected, sendCommand } = useWebSocket()

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard state={state} sendCommand={sendCommand} isConnected={isConnected} />
      case 'players':
        return <Players state={state} sendCommand={sendCommand} />
      case 'bans':
        return <Bans />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard state={state} sendCommand={sendCommand} isConnected={isConnected} />
    }
  }

  return (
    <div className="app-container">
      <Sidebar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        isConnected={isConnected}
        botConnected={state.botConnected}
      />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  )
}

export default App
