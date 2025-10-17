// Configuración que usa sqlcmd como referencia
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Configuración que replica lo que funciona con sqlcmd -S localhost -E
const dbConfig = {
  server: 'localhost',
  database: 'control_activos',
  options: {
    trustedConnection: true,
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true,
    instanceName: '', // Sin instancia específica
  }
}

let pool: any = null

export async function getConnectionSqlcmd(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    if (!pool) {
      console.log('🔍 Creando conexión con configuración sqlcmd...')
      console.log('Configuración:', JSON.stringify(dbConfig, null, 2))
      
      pool = new sql.ConnectionPool(dbConfig)
      await pool.connect()
      console.log('✅ Conexión establecida correctamente')
    }
    return pool
  } catch (error) {
    console.error('❌ Error al conectar:', error)
    console.error('Detalles del error:', error)
    throw error
  }
}

export async function executeQuerySqlcmd(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnectionSqlcmd()
    const request = connection.request()
    
    // Agregar parámetros si existen
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }
    
    console.log('🔍 Ejecutando consulta:', query)
    const result = await request.query(query)
    console.log('✅ Consulta ejecutada exitosamente')
    return result.recordset
  } catch (error) {
    console.error('❌ Error al ejecutar consulta:', error)
    throw error
  }
}
