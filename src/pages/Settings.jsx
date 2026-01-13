import { useState, useEffect } from 'react'
import appConfig from '../config'

const API_URL = appConfig.API_URL

export default function Settings() {
    const [config, setConfig] = useState({
        roomName: '',
        password: '',
        maxPlayers: 30,
        public: true,
        roomMode: '4v4'
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    useEffect(() => {
        fetchConfig()
    }, [])

    const fetchConfig = async () => {
        try {
            setLoading(true)
            const response = await fetch(`${API_URL}/config`)
            const data = await response.json()

            if (data.success) {
                setConfig(data.data)
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

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            setSaving(true)
            setSuccess(null)
            setError(null)

            const response = await fetch(`${API_URL}/config`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomName: config.roomName,
                    password: config.password || null,
                    maxPlayers: config.maxPlayers,
                    isPublic: config.public
                })
            })

            const data = await response.json()

            if (data.success) {
                setSuccess('Configuración guardada. Reinicia el bot para aplicar los cambios.')
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError('Error al guardar configuración')
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (field, value) => {
        setConfig(prev => ({ ...prev, [field]: value }))
    }

    if (loading) {
        return (
            <div className="settings-page animate-fadeIn">
                <div className="empty-state">
                    <div className="emoji animate-pulse">⏳</div>
                    <p>Cargando configuración...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="settings-page animate-fadeIn">
            <header className="page-header">
                <h1>Configuración</h1>
                <p>Ajustes de la sala de Haxball</p>
            </header>

            {error && (
                <div className="glass-card" style={{
                    background: 'rgba(255, 71, 87, 0.1)',
                    borderColor: 'var(--color-danger)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <p className="text-danger">❌ {error}</p>
                </div>
            )}

            {success && (
                <div className="glass-card" style={{
                    background: 'rgba(46, 213, 115, 0.1)',
                    borderColor: 'var(--color-success)',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <p className="text-success">✅ {success}</p>
                </div>
            )}

            <form className="settings-form glass-card" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="roomName">Nombre de la Sala</label>
                    <input
                        id="roomName"
                        type="text"
                        className="input"
                        value={config.roomName || ''}
                        onChange={(e) => handleChange('roomName', e.target.value)}
                        placeholder="Nombre de la sala..."
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Contraseña (dejar vacío para sala pública)</label>
                    <input
                        id="password"
                        type="text"
                        className="input"
                        value={config.password || ''}
                        onChange={(e) => handleChange('password', e.target.value)}
                        placeholder="Sin contraseña"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="maxPlayers">Máximo de Jugadores</label>
                    <input
                        id="maxPlayers"
                        type="number"
                        className="input"
                        value={config.maxPlayers || 30}
                        onChange={(e) => handleChange('maxPlayers', parseInt(e.target.value))}
                        min={2}
                        max={30}
                    />
                </div>

                <div className="form-group">
                    <label className="flex items-center gap-md" style={{ cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={config.public ?? true}
                            onChange={(e) => handleChange('public', e.target.checked)}
                            style={{ width: '20px', height: '20px' }}
                        />
                        <span>Sala Pública (visible en la lista de salas)</span>
                    </label>
                </div>

                <div className="form-group">
                    <label>Modo de Sala</label>
                    <input
                        type="text"
                        className="input"
                        value={config.roomMode || '4v4'}
                        disabled
                        style={{ opacity: 0.7, cursor: 'not-allowed' }}
                    />
                    <small className="text-muted" style={{ marginTop: 'var(--spacing-xs)', display: 'block' }}>
                        El modo de sala se configura en el archivo .env (ROOM_MODE)
                    </small>
                </div>

                <div className="form-actions">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={saving}
                    >
                        {saving ? '⏳ Guardando...' : '💾 Guardar Cambios'}
                    </button>
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={fetchConfig}
                    >
                        ↩️ Revertir
                    </button>
                </div>

                <div className="glass-card" style={{
                    marginTop: 'var(--spacing-xl)',
                    background: 'rgba(255, 165, 2, 0.1)',
                    borderColor: 'var(--color-warning)'
                }}>
                    <p className="text-warning">
                        ⚠️ <strong>Nota:</strong> Los cambios en la configuración requieren reiniciar el bot para tomar efecto.
                        Puedes reiniciarlo desde la VPS con: <code>pm2 restart haxball-x4</code>
                    </p>
                </div>
            </form>
        </div>
    )
}
