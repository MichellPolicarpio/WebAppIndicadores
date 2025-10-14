// Solo importar mssql en el servidor
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

import { env } from './env'

// Configuración de la base de datos usando variables de entorno
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
    min: 0,
    idleTimeoutMillis: 30000,
  },
  requestTimeout: 30000,
  connectionTimeout: 30000,
}

// Pool de conexiones
let pool: sql.ConnectionPool | null = null

// Función para obtener conexión
export async function getConnection(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    if (!pool) {
      pool = new sql.ConnectionPool(dbConfig)
      await pool.connect()
      console.log('✅ Conexión a SQL Server establecida correctamente')
    }
    return pool
  } catch (error) {
    console.error('❌ Error al conectar con SQL Server:', error)
    throw error
  }
}

// Función para cerrar conexión
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

// Función para ejecutar consultas
export async function executeQuery(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnection()
    const request = connection.request()
    
    // Agregar parámetros si existen
    if (params) {
      // Para consultas con @usuario, @contraseña, @id, etc.
      if (query.includes('@usuario') && query.includes('@contraseña')) {
        request.input('usuario', params[0])
        request.input('contraseña', params[1])
      } else if (query.includes('@id')) {
        request.input('id', params[0])
      } else {
        // Fallback para otros casos
        params.forEach((param, index) => {
          request.input(`param${index}`, param)
        })
      }
    }
    
    console.log('🔍 Ejecutando consulta SQL:', query)
    console.log('🔑 Parámetros:', params)
    
    const result = await request.query(query)
    console.log('✅ Consulta ejecutada exitosamente')
    return result.recordset
  } catch (error) {
    console.error('❌ Error al ejecutar consulta:', error)
    throw error
  }
}

// Función para ejecutar stored procedures
export async function executeStoredProcedure(
  procedureName: string, 
  params?: { [key: string]: any }
): Promise<any[]> {
  try {
    const connection = await getConnection()
    const request = connection.request()
    
    // Agregar parámetros si existen
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

// Función para probar la conexión
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
