import './Sidebar.css'

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'players', label: 'Jugadores', icon: '👥' },
    { id: 'bans', label: 'Bans', icon: '🚫' },
    { id: 'settings', label: 'Configuración', icon: '⚙️' }
]

export default function Sidebar({ currentPage, setCurrentPage, isConnected, botConnected }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo">
                    <span className="logo-icon">⚽</span>
                    <div className="logo-text">
                        <h1>Haxball</h1>
                        <span>Panel de Control</span>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                        onClick={() => setCurrentPage(item.id)}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
                    <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                    <span>API {isConnected ? 'Conectada' : 'Desconectada'}</span>
                </div>

                <div className={`connection-status ${botConnected ? 'connected' : 'disconnected'}`}>
                    <span className={`status-dot ${botConnected ? 'connected' : 'disconnected'}`}></span>
                    <span>Bot {botConnected ? 'Online' : 'Offline'}</span>
                </div>
            </div>
        </aside>
    )
}
