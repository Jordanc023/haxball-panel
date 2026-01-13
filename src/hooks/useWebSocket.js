import { useState, useEffect, useCallback, useRef } from 'react'
import config from '../config'

const WS_URL = `${config.WS_URL}?client=panel`

export default function useWebSocket() {
    const [isConnected, setIsConnected] = useState(false)
    const [state, setState] = useState({
        players: [],
        roomInfo: {
            isRunning: false,
            isPaused: false,
            score: { red: 0, blue: 0 },
            gameInProgress: false
        },
        botConnected: false
    })

    const wsRef = useRef(null)
    const reconnectTimeoutRef = useRef(null)

    const connect = useCallback(() => {
        try {
            console.log('[WS] Conectando a', WS_URL)
            const ws = new WebSocket(WS_URL)
            wsRef.current = ws

            ws.onopen = () => {
                console.log('[WS] ✓ Conectado')
                setIsConnected(true)

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current)
                    reconnectTimeoutRef.current = null
                }
            }

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data)
                    handleMessage(msg)
                } catch (err) {
                    console.error('[WS] Error parsing message:', err)
                }
            }

            ws.onclose = () => {
                console.log('[WS] Desconectado')
                setIsConnected(false)
                wsRef.current = null

                // Reconectar en 3 segundos
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 3000)
            }

            ws.onerror = (err) => {
                console.error('[WS] Error:', err)
            }

        } catch (err) {
            console.error('[WS] Error conectando:', err)
        }
    }, [])

    const handleMessage = (msg) => {
        const { type, data } = msg

        switch (type) {
            case 'INITIAL_STATE':
                setState(data)
                break

            case 'PLAYERS_UPDATE':
                setState(prev => ({ ...prev, players: data }))
                break

            case 'ROOM_UPDATE':
                setState(prev => ({
                    ...prev,
                    roomInfo: { ...prev.roomInfo, ...data }
                }))
                break

            case 'PLAYER_JOIN':
                setState(prev => ({
                    ...prev,
                    players: [...prev.players, data]
                }))
                break

            case 'PLAYER_LEAVE':
                setState(prev => ({
                    ...prev,
                    players: prev.players.filter(p => p.id !== data.id)
                }))
                break

            case 'BOT_STATUS':
                setState(prev => ({ ...prev, botConnected: data.connected }))
                break

            case 'GAME_START':
                setState(prev => ({
                    ...prev,
                    roomInfo: { ...prev.roomInfo, gameInProgress: true, isPaused: false }
                }))
                break

            case 'GAME_STOP':
                setState(prev => ({
                    ...prev,
                    roomInfo: { ...prev.roomInfo, gameInProgress: false, isPaused: false }
                }))
                break

            case 'GOAL':
                // Score update viene en ROOM_UPDATE separado
                break

            case 'PLAYER_TEAM_CHANGE':
                setState(prev => ({
                    ...prev,
                    players: prev.players.map(p =>
                        p.id === data.id ? { ...p, team: data.team } : p
                    )
                }))
                break

            case 'ERROR':
                console.error('[WS] Server error:', data.message)
                break

            default:
                console.log('[WS] Mensaje no manejado:', type, data)
        }
    }

    const sendCommand = useCallback((action, params = {}) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn('[WS] No conectado, no se puede enviar comando')
            return false
        }

        const message = {
            type: 'ROOM_COMMAND',
            data: { action, ...params }
        }

        wsRef.current.send(JSON.stringify(message))
        return true
    }, [])

    useEffect(() => {
        connect()

        return () => {
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
            if (wsRef.current) {
                wsRef.current.close()
            }
        }
    }, [connect])

    return { state, isConnected, sendCommand }
}
