import { useState, useEffect } from 'react'
import config from '../config'

const API_URL = config.API_URL

export default function Bans() {
    const [bans, setBans] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        fetchBans()
    }, [])

    const fetchBans = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/bans`)
            const data = await response.json()

            if (data.success) {
                setBans(data.data)
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

    const handleUnban = async (player) => {
        if (!confirm(`¿Desbanear a ${player.name}?`)) return

        try {
            const response = await fetch(`${API_URL}/bans/${player.odid}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                alert(`${player.name} ha sido desbaneado`)
                fetchBans()
            } else {
                alert(`Error: ${data.error}`)
            }
        } catch (err) {
            alert('Error al desbanear jugador')
        }
    }

    const filteredBans = bans.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="bans-page animate-fadeIn">
            <header className="page-header">
                <h1>Gestión de Bans</h1>
                <p>Jugadores baneados de la sala</p>
            </header>

            {/* Search */}
            <div className="section-header" style={{ marginBottom: 'var(--spacing-xl)' }}>
                <div className="flex items-center gap-md">
                    <span className="badge badge-offline">{bans.length} baneados</span>
                    <button className="btn btn-ghost" onClick={fetchBans}>
                        🔄 Actualizar
                    </button>
                </div>
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

            {/* Bans List */}
            {loading ? (
                <div className="empty-state">
                    <div className="emoji animate-pulse">⏳</div>
                    <p>Cargando bans...</p>
                </div>
            ) : error ? (
                <div className="empty-state glass-card">
                    <div className="emoji">❌</div>
                    <p className="text-danger">{error}</p>
                    <button className="btn btn-primary mt-md" onClick={fetchBans}>
                        🔄 Reintentar
                    </button>
                </div>
            ) : filteredBans.length === 0 ? (
                <div className="empty-state glass-card">
                    <div className="emoji">✨</div>
                    <p>No hay jugadores baneados</p>
                </div>
            ) : (
                <div className="bans-list">
                    {filteredBans.map(player => (
                        <div key={player.odid} className="glass-card ban-item">
                            <div className="ban-info">
                                <h3>🚫 {player.name || 'Sin nombre'}</h3>
                                <p>
                                    <strong>Razón:</strong> {player.banReason || 'Sin razón especificada'}
                                </p>
                                <p>
                                    <strong>Fecha:</strong> {player.banDate ? new Date(player.banDate).toLocaleString() : 'Desconocida'}
                                </p>
                                {player.bannedBy && (
                                    <p>
                                        <strong>Por:</strong> {player.bannedBy}
                                    </p>
                                )}
                                <p className="text-muted" style={{ fontSize: 'var(--font-size-xs)', marginTop: 'var(--spacing-xs)' }}>
                                    ODID: {player.odid}
                                </p>
                            </div>
                            <div className="ban-actions">
                                <button
                                    className="btn btn-success"
                                    onClick={() => handleUnban(player)}
                                >
                                    ✓ Desbanear
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
