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
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
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
    // Si el pool no existe o está cerrado, crear uno nuevo
    if (!pool || !pool.connected) {
      console.log('🔄 Creando nueva conexión al pool...')
      pool = new sql.ConnectionPool(dbConfig)
      await pool.connect()
      console.log('✅ Conexión a SQL Server establecida correctamente')
      
      // Manejar eventos del pool
      pool.on('error', (err: any) => {
        console.error('❌ Error en el pool de SQL Server:', err)
        pool = null
      })
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

// Ejecuta consulta SQL con parámetros (soporta arrays legacy y objetos)
export async function executeQuery(query: string, params?: any[] | Record<string, any>): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnection()
    
    // Verificar que la conexión esté activa
    if (!connection || !connection.connected) {
      console.warn('⚠️ Conexión no activa, reconectando...')
      pool = null
      const newConnection = await getConnection()
      const request = newConnection.request()
      
      // Agregar parámetros
      if (params) {
        if (Array.isArray(params)) {
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
          Object.entries(params).forEach(([key, value]) => {
            request.input(key, value)
          })
        }
      }
      
      console.log('🔍 Ejecutando consulta SQL (reconectado):', query.substring(0, 100) + '...')
      console.log('🔑 Parámetros:', params)
      
      const result = await request.query(query)
      console.log('✅ Consulta ejecutada exitosamente')
      return result.recordset
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
    
    console.log('🔍 Ejecutando consulta SQL:', query.substring(0, 100) + '...')
    console.log('🔑 Parámetros:', params)
    
    const result = await request.query(query)
    console.log('✅ Consulta ejecutada exitosamente:', result.recordset?.length || 0, 'registros')
    return result.recordset
  } catch (error: any) {
    console.error('❌ Error al ejecutar consulta:', error.message)
    // Si el error es de conexión cerrada, intentar reconectar
    if (error.message && error.message.includes('Connection is closed')) {
      console.log('🔄 Intentando reconectar después de error...')
      pool = null
      // Reintentar una vez
      return executeQuery(query, params)
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
