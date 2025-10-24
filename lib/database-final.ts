// Configuración final que debería funcionar
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Configuración específica para SQL Server Express
const dbConfig = {
  server: 'localhost\\SQLEXPRESS', // Usar la instancia específica
  database: 'control_activos',
  options: {
    trustedConnection: true,
    encrypt: true,                    // 🔐 OBLIGATORIO para Azure SQL
    trustServerCertificate: false,    // 🔒 NO confiar en certs self-signed
    enableArithAbort: true,
  }
}

// Configuración alternativa si la primera falla
const dbConfigAlt = {
  server: 'localhost',
  database: 'control_activos',
  user: 'sa',
  password: 'Passw0rd!',
  options: {
    encrypt: true,                    // 🔐 OBLIGATORIO para Azure SQL
    trustServerCertificate: false,    // 🔒 NO confiar en certs self-signed
    enableArithAbort: true,
  }
}

let pool: any = null
let currentConfig: any = null

export async function getConnectionFinal(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    if (!pool) {
      // Intentar primero con SQLEXPRESS
      try {
        console.log('🔍 Intentando conexión con SQLEXPRESS...')
        pool = new sql.ConnectionPool(dbConfig)
        await pool.connect()
        currentConfig = dbConfig
        console.log('✅ Conexión exitosa con SQLEXPRESS')
      } catch (error) {
        console.log('❌ SQLEXPRESS falló, intentando con localhost...')
        
        // Intentar con localhost y credenciales SQL
        try {
          pool = new sql.ConnectionPool(dbConfigAlt)
          await pool.connect()
          currentConfig = dbConfigAlt
          console.log('✅ Conexión exitosa con credenciales SQL')
        } catch (altError) {
          console.error('❌ Ambas configuraciones fallaron')
          throw altError
        }
      }
    }
    return pool
  } catch (error) {
    console.error('❌ Error al conectar:', error)
    throw error
  }
}

export async function executeQueryFinal(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnectionFinal()
    const request = connection.request()
    
    // Agregar parámetros si existen
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }
    
    console.log('🔍 Ejecutando consulta con configuración:', currentConfig?.server)
    const result = await request.query(query)
    console.log('✅ Consulta ejecutada exitosamente')
    return result.recordset
  } catch (error) {
    console.error('❌ Error al ejecutar consulta:', error)
    // Si la conexión se cerró, intentar reconectar
    if (error.code === 'ECONNCLOSED') {
      console.log('🔄 Reconectando...')
      pool = null
      currentConfig = null
      return executeQueryFinal(query, params)
    }
    throw error
  }
}
