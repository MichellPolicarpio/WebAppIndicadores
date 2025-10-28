// Configuración simple de la base de datos
let sql: any = null
if (typeof window === 'undefined') {
  sql = require('mssql')
}

// Diferentes opciones de conexión
const connectionOptions = [
  // Opción 1: Autenticación de Windows
  {
    server: 'localhost',
    database: 'control_activos',
    options: {
      trustedConnection: true,
      encrypt: false,
      trustServerCertificate: true,
    }
  },
  // Opción 2: SQL Server con credenciales diferentes
  {
    server: 'localhost',
    database: 'control_activos',
    user: 'sa',
    password: 'Passw0rd!',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    }
  },
  // Opción 3: Sin contraseña
  {
    server: 'localhost',
    database: 'control_activos',
    user: 'sa',
    password: '',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    }
  },
  // Opción 4: Con instancia
  {
    server: 'localhost\\SQLEXPRESS',
    database: 'control_activos',
    user: 'sa',
    password: 'Passw0rd!',
    options: {
      encrypt: false,
      trustServerCertificate: true,
    }
  }
]

let pool: any = null

export async function testAllConnections(): Promise<any> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  if (!sql) {
    throw new Error('Módulo mssql no disponible')
  }
  
  const results = []
  
  for (let i = 0; i < connectionOptions.length; i++) {
    const config = connectionOptions[i]
    try {
      console.log(`🔍 Probando opción ${i + 1}:`, config.server, config.user ? `usuario: ${config.user}` : 'Windows Auth')
      
      const testPool = new sql.ConnectionPool(config)
      await testPool.connect()
      
      // Probar consulta simple
      const request = testPool.request()
      const result = await request.query('SELECT 1 as test')
      
      console.log(`✅ Opción ${i + 1} exitosa:`, result.recordset)
      
      await testPool.close()
      
      results.push({
        option: i + 1,
        success: true,
        config: config,
        result: result.recordset
      })
      
    } catch (error) {
      console.log(`❌ Opción ${i + 1} falló:`, error.message)
      results.push({
        option: i + 1,
        success: false,
        config: config,
        error: error.message
      })
    }
  }
  
  return results
}

export async function executeQuerySimple(query: string, params?: any[]): Promise<any[]> {
  if (typeof window !== 'undefined') {
    throw new Error('Esta función solo puede ejecutarse en el servidor')
  }
  
  // Usar la primera configuración exitosa
  if (!pool) {
    const results = await testAllConnections()
    const successfulOption = results.find(r => r.success)
    
    if (!successfulOption) {
      throw new Error('No se pudo conectar con ninguna configuración')
    }
    
    console.log(`🔗 Usando configuración exitosa: Opción ${successfulOption.option}`)
    pool = new sql.ConnectionPool(successfulOption.config)
    await pool.connect()
  }
  
  try {
    const request = pool.request()
    
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
