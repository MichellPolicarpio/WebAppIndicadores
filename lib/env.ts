// Configuración de variables de entorno
export const env = {
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
  auth: {
    secret: process.env.AUTH_SECRET || 'tu-clave-secreta-aqui',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  }
}

// Función para validar configuración
export function validateEnv() {
  const required = ['DB_SERVER', 'DB_DATABASE', 'DB_USER', 'DB_PASSWORD']
  const missing = required.filter(key => !process.env[key])
  
  if (missing.length > 0) {
    console.warn(`⚠️ Variables de entorno faltantes: ${missing.join(', ')}`)
    console.warn('Usando valores por defecto...')
  }
  
  return true
}
