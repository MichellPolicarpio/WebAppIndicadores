// Configuración de la aplicación
export const config = {
  database: {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'control_activos',
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'Passw0rd!',
    port: parseInt(process.env.DB_PORT || '1433'),
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'SIVEG',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },
}

// Función para validar configuración
export function validateConfig() {
  const required = ['server', 'database', 'user', 'password']
  const missing = required.filter(key => !config.database[key as keyof typeof config.database])
  
  if (missing.length > 0) {
    throw new Error(`Configuración faltante: ${missing.join(', ')}`)
  }
  
  return true
}
