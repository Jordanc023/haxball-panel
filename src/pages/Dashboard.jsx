export default function Dashboard({ state, sendCommand, isConnected }) {
    const { players, roomInfo, botConnected } = state

    const redPlayers = players.filter(p => p.team === 1)
    const bluePlayers = players.filter(p => p.team === 2)
    const spectators = players.filter(p => p.team === 0)

    const handlePause = () => {
        if (roomInfo.isPaused) {
            sendCommand('unpause')
        } else {
            sendCommand('pause')
        }
    }

    const handleRestart = () => {
        if (confirm('¿Reiniciar el juego actual?')) {
            sendCommand('restart')
        }
    }

    const handleStop = () => {
        if (confirm('¿Detener el juego?')) {
            sendCommand('stop')
        }
    }

    const handleBroadcast = () => {
        const message = prompt('Mensaje para todos los jugadores:')
        if (message) {
            sendCommand('broadcast', { message })
        }
    }

    const handleKick = (playerId, playerName) => {
        const reason = prompt(`Razón para expulsar a ${playerName}:`, 'Expulsado por admin')
        if (reason !== null) {
            sendCommand('kick', { playerId, reason })
        }
    }

    return (
        <div className="dashboard animate-fadeIn">
            <header className="page-header">
                <h1>Dashboard</h1>
                <p>Panel de control en tiempo real</p>
            </header>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="glass-card stat-card">
                    <div className="stat-icon players">👥</div>
                    <div className="stat-value">{players.length}</div>
                    <div className="stat-label">Jugadores Conectados</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon game">🎮</div>
                    <div className="stat-value">
                        {roomInfo.gameInProgress ? (roomInfo.isPaused ? 'Pausado' : 'En Juego') : 'Esperando'}
                    </div>
                    <div className="stat-label">Estado del Juego</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon score">⚽</div>
                    <div className="stat-value">
                        <span style={{ color: 'var(--color-red)' }}>{roomInfo.score?.red || 0}</span>
                        {' - '}
                        <span style={{ color: '#3742fa' }}>{roomInfo.score?.blue || 0}</span>
                    </div>
                    <div className="stat-label">Marcador</div>
                </div>

                <div className="glass-card stat-card">
                    <div className="stat-icon status">🤖</div>
                    <div className="stat-value">
                        {botConnected ? '✓ Online' : '✕ Offline'}
                    </div>
                    <div className="stat-label">Estado del Bot</div>
                </div>
            </div>

            {/* Control Panel */}
            <div className="glass-card">
                <h2 style={{ marginBottom: 'var(--spacing-lg)' }}>🎛️ Controles de Sala</h2>

                {!botConnected ? (
                    <div className="empty-state" style={{ padding: 'var(--spacing-lg)' }}>
                        <p className="text-warning">⚠️ El bot no está conectado. Inicia la API y el bot para controlar la sala.</p>
                    </div>
                ) : (
                    <div className="control-panel">
                        <button
                            className={`btn ${roomInfo.isPaused ? 'btn-success' : 'btn-primary'} control-btn`}
                            onClick={handlePause}
                            disabled={!roomInfo.gameInProgress}
                        >
                            {roomInfo.isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}
                        </button>

                        <button
                            className="btn btn-ghost control-btn"
                            onClick={handleRestart}
                            disabled={!roomInfo.gameInProgress}
                        >
                            🔄 Reiniciar
                        </button>

                        <button
                            className="btn btn-danger control-btn"
                            onClick={handleStop}
                            disabled={!roomInfo.gameInProgress}
                        >
                            ⏹️ Detener
                        </button>

                        <button
                            className="btn btn-ghost control-btn"
                            onClick={handleBroadcast}
                        >
                            📢 Broadcast
                        </button>
                    </div>
                )}
            </div>

            {/* Players Section */}
            <section className="players-section">
                <div className="section-header">
                    <h2>👥 Jugadores en Sala ({players.length})</h2>
                </div>

                {players.length === 0 ? (
                    <div className="glass-card empty-state">
                        <div className="emoji">🏟️</div>
                        <p>No hay jugadores conectados</p>
                    </div>
                ) : (
                    <div className="players-grid">
                        {/* Red Team */}
                        {redPlayers.length > 0 && (
                            <div className="glass-card">
                                <h3 style={{ color: 'var(--color-red)', marginBottom: 'var(--spacing-md)' }}>
                                    🔴 Equipo Rojo ({redPlayers.length})
                                </h3>
                                {redPlayers.map(player => (
                                    <PlayerItem
                                        key={player.id}
                                        player={player}
                                        onKick={handleKick}
                                        disabled={!botConnected}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Blue Team */}
                        {bluePlayers.length > 0 && (
                            <div className="glass-card">
                                <h3 style={{ color: '#5c7cfa', marginBottom: 'var(--spacing-md)' }}>
                                    🔵 Equipo Azul ({bluePlayers.length})
                                </h3>
                                {bluePlayers.map(player => (
                                    <PlayerItem
                                        key={player.id}
                                        player={player}
                                        onKick={handleKick}
                                        disabled={!botConnected}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Spectators */}
                        {spectators.length > 0 && (
                            <div className="glass-card">
                                <h3 style={{ color: 'var(--color-spectator)', marginBottom: 'var(--spacing-md)' }}>
                                    👀 Espectadores ({spectators.length})
                                </h3>
                                {spectators.map(player => (
                                    <PlayerItem
                                        key={player.id}
                                        player={player}
                                        onKick={handleKick}
                                        disabled={!botConnected}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    )
}

function PlayerItem({ player, onKick, disabled }) {
    const teamClass = player.team === 1 ? 'red' : player.team === 2 ? 'blue' : 'spectator'

    return (
        <div className="player-card glass-card" style={{ marginBottom: 'var(--spacing-sm)' }}>
            <div className={`player-avatar ${teamClass}`}>
                {player.name.charAt(0).toUpperCase()}
            </div>
            <div className="player-info">
                <div className="player-name">
                    {player.admin && '👑 '}
                    {player.name}
                </div>
                <div className="player-meta">
                    <span>ID: {player.id}</span>
                </div>
            </div>
            <div className="player-actions">
                <button
                    className="btn btn-danger btn-icon"
                    onClick={() => onKick(player.id, player.name)}
                    disabled={disabled}
                    title="Expulsar"
                >
                    🚫
                </button>
            </div>
        </div>
    )
}
