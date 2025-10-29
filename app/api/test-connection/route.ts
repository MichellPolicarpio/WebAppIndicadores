import { NextResponse } from 'next/server'
import { testDatabaseConnection, getSampleData } from '@/lib/test-connection'

export async function GET() {
  try {
    console.log('🔍 Iniciando prueba de conexión...')
    
    // Probar conexión
    const isConnected = await testDatabaseConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'No se pudo conectar a la base de datos',
          error: 'Connection failed'
        },
        { status: 500 }
      )
    }
    
    // Obtener datos de ejemplo
    const sampleData = await getSampleData()
    
    return NextResponse.json({
      success: true,
      message: 'Conexión a SQL Server exitosa',
      data: sampleData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('❌ Error en API de prueba:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al conectar con la base de datos',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
