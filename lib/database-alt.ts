// Configuración alternativa de la base de datos
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Configuración con autenticación de Windows
const dbConfigWindows: any = {
  server: 'localhost',
  database: 'control_activos',
  options: {
    trustedConnection: true, // Usar autenticación de Windows
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

// Configuración con autenticación SQL
const dbConfigSQL: any = {
  server: 'localhost',
  database: 'control_activos',
  user: 'sa',
  password: 'Passw0rd!',
  port: 1433,
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

let pool: any = null

// Función para probar diferentes configuraciones
export async function getConnectionAlt(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  // Intentar primero con autenticación de Windows
  try {
    console.log('🔍 Intentando conexión con autenticación de Windows...')
    pool = new sql.ConnectionPool(dbConfigWindows)
    await pool.connect()
    console.log('✅ Conexión exitosa con autenticación de Windows')
    return pool
  } catch (error) {
    console.log('❌ Falló autenticación de Windows, intentando con SQL...')
    
    try {
      pool = new sql.ConnectionPool(dbConfigSQL)
      await pool.connect()
      console.log('✅ Conexión exitosa con autenticación SQL')
      return pool
    } catch (sqlError) {
      console.error('❌ Ambas configuraciones fallaron:')
      console.error('Windows Auth Error:', error)
      console.error('SQL Auth Error:', sqlError)
      throw sqlError
    }
  }
}

// Función para ejecutar consultas con configuración alternativa
export async function executeQueryAlt(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnectionAlt()
    const request = connection.request()
    
    // Agregar parámetros si existen
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }
    
    const result = await request.query(query)
    return result.recordset
  } catch (error) {
    console.error('❌ Error al ejecutar consulta:', error)
    throw error
  }
}
