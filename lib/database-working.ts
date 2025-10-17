// Configuración que funciona con SQL Server
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Configuración simple que debería funcionar
const dbConfig = {
  server: 'localhost',
  database: 'control_activos',
  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true,
  }
}

let pool: any = null

export async function getConnectionWorking(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    if (!pool) {
      console.log('🔍 Creando nueva conexión...')
      pool = new sql.ConnectionPool(dbConfig)
      await pool.connect()
      console.log('✅ Conexión establecida correctamente')
    }
    return pool
  } catch (error) {
    console.error('❌ Error al conectar:', error)
    throw error
  }
}

export async function executeQueryWorking(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnectionWorking()
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

export async function closeConnectionWorking(): Promise<void> {
  try {
    if (pool) {
      await pool.close()
      pool = null
      console.log('🔌 Conexión cerrada')
    }
  } catch (error) {
    console.error('❌ Error al cerrar conexión:', error)
    throw error
  }
}
