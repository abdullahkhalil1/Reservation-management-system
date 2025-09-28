export const API_CONFIG = {
  BASE_URL: import.meta.env.DEV 
    ? (import.meta.env.VITE_DEV_API_PATH || '/api')
    : (import.meta.env.VITE_API_BASE_URL || 'https://api.foodics.dev/v5'),
  TOKEN: import.meta.env.VITE_API_TOKEN || '',
  TIMEOUT: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  DEBUG: import.meta.env.VITE_API_DEBUG === 'true'
} as const

