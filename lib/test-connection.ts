import { testConnection, getConnection } from './database'
import { IndicadorService } from './services/indicadorService'

// Función para probar la conexión completa
export async function testDatabaseConnection() {
  try {
    console.log('🔍 Probando conexión a SQL Server...')
    
    // Probar conexión básica
    const isConnected = await testConnection()
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos')
    }
    
    console.log('✅ Conexión a SQL Server exitosa')
    
    // Probar consultas básicas
    console.log('🔍 Probando consultas...')
    
    // Obtener empresas
    const empresas = await IndicadorService.getEmpresasOperadoras()
    console.log(`✅ Empresas encontradas: ${empresas.length}`)
    
    // Obtener gerencias
    const gerencias = await IndicadorService.getGerencias()
    console.log(`✅ Gerencias encontradas: ${gerencias.length}`)
    
    // Obtener unidades
    const unidades = await IndicadorService.getUnidades()
    console.log(`✅ Unidades encontradas: ${unidades.length}`)
    
    // Obtener variables
    const variables = await IndicadorService.getVariables()
    console.log(`✅ Variables encontradas: ${variables.length}`)
    
    console.log('🎉 Todas las pruebas de conexión pasaron correctamente')
    return true
    
  } catch (error) {
    console.error('❌ Error en las pruebas de conexión:', error)
    return false
  }
}

// Función para obtener datos de ejemplo
export async function getSampleData() {
  try {
    const empresas = await IndicadorService.getEmpresasOperadoras()
    const gerencias = await IndicadorService.getGerencias()
    const unidades = await IndicadorService.getUnidades()
    const variables = await IndicadorService.getVariables()
    
    return {
      empresas,
      gerencias,
      unidades,
      variables,
      total: {
        empresas: empresas.length,
        gerencias: gerencias.length,
        unidades: unidades.length,
        variables: variables.length
      }
    }
  } catch (error) {
    console.error('Error al obtener datos de ejemplo:', error)
    throw error
  }
}
