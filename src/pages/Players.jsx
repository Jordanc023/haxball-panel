import { useState, useEffect } from 'react'
import config from '../config'

const API_URL = config.API_URL

export default function Players({ state, sendCommand }) {
    const [dbPlayers, setDbPlayers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchPlayers()
    }, [])

    const fetchPlayers = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/players?limit=50&sort=lastSeen`)
            const data = await response.json()

            if (data.success) {
                setDbPlayers(data.data)
                setError(null)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('No se pudo conectar con la API')
        } finally {
            setLoading(false)
        }
    }

    const filteredPlayers = dbPlayers.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.odid?.includes(search)
    )

    const handleBan = async (player) => {
        const reason = prompt(`Razón para banear a ${player.name}:`, 'Baneado por admin')
        if (reason === null) return

        try {
            const response = await fetch(`${API_URL}/bans`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ odid: player.odid, reason })
            })
            const data = await response.json()

            if (data.success) {
                alert(`${player.name} ha sido baneado`)
                fetchPlayers()
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (err) {
            alert('Error al banear jugador')
        }
    }

    return (
        <div className="players-page animate-fadeIn">
            <header className="page-header">
                <h1>Jugadores</h1>
                <p>Base de datos de jugadores registrados</p>
            </header>

            {/* Online Players */}
            <section className="glass-card" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h2 style={{ marginBottom: 'var(--spacing-md)' }}>
                    🟢 En línea ahora ({state.players.length})
                </h2>

                {state.players.length === 0 ? (
                    <p className="text-muted">No hay jugadores conectados</p>
                ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-sm)' }}>
                        {state.players.map(p => (
                            <span key={p.id} className={`badge ${p.team === 1 ? 'badge-red' : p.team === 2 ? 'badge-blue' : 'badge-spectator'
                                }`}>
                                {p.admin && '👑 '}{p.name}
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {/* Search */}
            <div className="section-header">
                <h2>📊 Histórico de Jugadores</h2>
                <div className="search-bar">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        className="input"
                        placeholder="Buscar por nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Players Table */}
            {loading ? (
                <div className="empty-state">
                    <div className="emoji animate-pulse">⏳</div>
                    <p>Cargando jugadores...</p>
                </div>
            ) : error ? (
                <div className="empty-state">
                    <div className="emoji">❌</div>
                    <p className="text-danger">{error}</p>
                    <button className="btn btn-primary mt-md" onClick={fetchPlayers}>
                        🔄 Reintentar
                    </button>
                </div>
            ) : (
                <div className="glass-card">
                    <table className="players-table">
                        <thead>
                            <tr>
                                <th>Jugador</th>
                                <th>Partidos</th>
                                <th>V/D</th>
                                <th>Goles</th>
                                <th>Asistencias</th>
                                <th>Puntos</th>
                                <th>Última vez</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredPlayers.map(player => (
                                <tr key={player.odid} className={player.isBanned ? 'banned' : ''}>
                                    <td>
                                        <div className="player-cell">
                                            <span className="player-name">
                                                {player.isBanned && '🚫 '}
                                                {player.name || 'Sin nombre'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>{player.gamesPlayed || 0}</td>
                                    <td>
                                        <span className="text-success">{player.wins || 0}</span>
                                        /
                                        <span className="text-danger">{player.losses || 0}</span>
                                    </td>
                                    <td>{player.goals || 0}</td>
                                    <td>{player.assists || 0}</td>
                                    <td>{player.points || 0}</td>
                                    <td className="text-muted">
                                        {player.lastSeen ? new Date(player.lastSeen).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td>
                                        {!player.isBanned && (
                                            <button
                                                className="btn btn-danger btn-icon"
                                                onClick={() => handleBan(player)}
                                                title="Banear"
                                            >
                                                🚫
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPlayers.length === 0 && (
                        <div className="empty-state">
                            <p>No se encontraron jugadores</p>
                        </div>
                    )}
                </div>
            )}

            <style>{`
        .players-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .players-table th,
        .players-table td {
          padding: var(--spacing-md);
          text-align: left;
          border-bottom: 1px solid var(--glass-border);
        }
        
        .players-table th {
          font-size: var(--font-size-sm);
          font-weight: 600;
          color: var(--color-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .players-table tr:hover {
          background: var(--glass-bg);
        }
        
        .players-table tr.banned {
          opacity: 0.6;
        }
        
        .player-cell {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
        }
      `}</style>
        </div>
    )
}
