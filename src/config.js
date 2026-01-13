/**
 * Configuración del Panel
 * Las URLs pueden ser configuradas via variables de entorno en Vercel
 */

// URL de la API en tu VPS
const API_URL = import.meta.env.VITE_API_URL || 'http://157.137.219.245:3001/api'

// URL del WebSocket en tu VPS
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://157.137.219.245:3001/ws'

const config = {
    API_URL,
    WS_URL,
    // Para desarrollo local, puedes cambiar a localhost
    // API_URL: 'http://localhost:3001/api',
    // WS_URL: 'ws://localhost:3001/ws',
}

export default config
