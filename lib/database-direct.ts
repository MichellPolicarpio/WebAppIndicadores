// Solución directa usando cadena de conexión
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Cadena de conexión directa que replica sqlcmd -S localhost -E
const connectionString = "Server=localhost;Database=control_activos;Trusted_Connection=true;TrustServerCertificate=true;"

let pool: any = null

export async function getConnectionDirect(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  try {
    if (!pool) {
      console.log('🔍 Creando conexión directa...')
      console.log('Cadena de conexión:', connectionString)
      
      pool = new sql.ConnectionPool(connectionString)
      await pool.connect()
      console.log('✅ Conexión directa establecida')
    }
    return pool
  } catch (error) {
    console.error('❌ Error en conexión directa:', error)
    throw error
  }
}

export async function executeQueryDirect(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  try {
    const connection = await getConnectionDirect()
    const request = connection.request()
    
    // Agregar parámetros si existen
    if (params) {
      params.forEach((param, index) => {
        request.input(`param${index}`, param)
      })
    }
    
    console.log('🔍 Ejecutando consulta directa...')
    const result = await request.query(query)
    console.log('✅ Consulta directa ejecutada')
    return result.recordset
  } catch (error) {
    console.error('❌ Error en consulta directa:', error)
    throw error
  }
}
