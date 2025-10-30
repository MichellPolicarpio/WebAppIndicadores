// Módulo de conexión a SQL Server con pool de conexiones

// Importar mssql solo en servidor (no funciona en el cliente)
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

import { env } from './env'

// Configuración de conexión desde variables de entorno
const dbConfig: any = {
  server: env.database.server,
  database: env.database.database,
  user: env.database.user,
  password: env.database.password,
  port: env.database.port,
  options: {
    encrypt: true,                    // 🔐 OBLIGATORIO para Azure SQL
    trustServerCertificate: false,    // 🔒 NO confiar en certs self-signed
    enableArithAbort: true,
    // Configuración TLS específica para Azure
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1.2',
      maxVersion: 'TLSv1.3'
    },
    // Configuración adicional para Azure SQL
    useUTC: true,
    abortTransactionOnError: true,
    isolationLevel: 2  // READ_COMMITTED = 2
  },
  pool: {
    max: 10,
    min: 2, // Mantener al menos 2 conexiones activas
    idleTimeoutMillis: 600000, // 10 minutos antes de cerrar conexiones idle
  },
  requestTimeout: 60000, // 60 segundos para queries
  connectionTimeout: 30000, // 30 segundos para conectar
}

// Pool global de conexiones (reutilizable)
let pool: any = null

// Obtiene conexión del pool (crea si no existe)
export async function getConnection(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    // Si el pool no existe, crear uno nuevo
    if (!pool) {
      console.log('🔄 Creando nueva conexión al pool...')
      pool = new sql.ConnectionPool(dbConfig)
      await pool.connect()
      console.log('✅ Conexión a SQL Server establecida correctamente')

      // FIX: Proteger pool.on - solo si pool existe y tiene método 'on'
      if (pool && typeof pool.on === 'function') {
        pool.on('error', (err: any) => {
          console.error('❌ Error en el pool de SQL Server:', err)
          pool = null
        })
      }
    }
    return pool
  } catch (error) {
    console.error('❌ Error al conectar con SQL Server:', error)
    pool = null // Resetear el pool en caso de error
    throw error
  }
}

// Cierra el pool de conexiones
export async function closeConnection(): Promise<void> {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('🔌 Conexión a SQL Server cerrada')
    }
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error)
    throw error
  }
}

// Variable para controlar reintentos de reconexión
let reconnectAttempts = 0
const MAX_RECONNECT_ATTEMPTS = 2

// Ejecuta consulta SQL con parámetros (soporta arrays legacy y objetos)
export async function executeQuery(query: string, params?: any[] | Record<string, any>): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    let connection = await getConnection()
    // Guard: si por alguna razón la conexión es null, reintentar creando pool
    if (!connection) {
      console.warn('⚠️ getConnection retornó null. Reintentando crear pool...')
      pool = null
      connection = await getConnection()
      if (!connection) {
        throw new Error('No fue posible obtener conexión a la base de datos')
      }
    }
    
    const request = connection.request()
    
    // Agregar parámetros según el tipo
    if (params) {
      if (Array.isArray(params)) {
        // Legacy: mapeo específico para compatibilidad
        if (query.includes('@usuario') && query.includes('@contraseña')) {
          request.input('usuario', params[0])
          request.input('contraseña', params[1])
        } else if (query.includes('@id')) {
          request.input('id', params[0])
        } else {
          params.forEach((param, index) => {
            request.input(`param${index}`, param)
          })
        }
      } else {
        // Recomendado: objeto { paramName: value }
        Object.entries(params).forEach(([key, value]) => {
          request.input(key, value)
        })
      }
    }
    
    const result = await request.query(query)
    
    // Resetear contador de reintentos en caso de éxito
    reconnectAttempts = 0
    
    return result.recordset || []
  } catch (error: any) {
    console.error('❌ Error al ejecutar consulta:', error.message)
    
    // Si el error es de conexión cerrada, intentar reconectar (con límite)
    if (error.message && error.message.includes('Connection is closed') && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts++
      console.log(`🔄 Intento de reconexión ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS}...`)
      pool = null
      await new Promise(resolve => setTimeout(resolve, 500))
      return executeQuery(query, params)
    }
    
    // Resetear contador si se superó el límite
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      reconnectAttempts = 0
    }
    
    throw error
  }
}

// Ejecuta stored procedure con parámetros
export async function executeStoredProcedure(
  procedureName: string, 
  params?: { [key: string]: any }
): Promise<any[]> {
  try {
    const connection = await getConnection()
    const request = connection.request()
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        request.input(key, value)
      })
    }
    
    const result = await request.execute(procedureName)
    return result.recordset
  } catch (error) {
    console.error('❌ Error al ejecutar stored procedure:', error)
    throw error
  }
}

// Prueba conexión a SQL Server (útil para healthcheck)
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await getConnection()
    const result = await connection.request().query('SELECT 1 as test')
    console.log('✅ Conexión a SQL Server funcionando correctamente')
    return true
  } catch (error) {
    console.error('❌ Error en la conexión:', error)
    return false
  }
}

export default dbConfig
