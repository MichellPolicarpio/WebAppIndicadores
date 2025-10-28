import { NextResponse } from 'next/server'
import { testAllConnections, executeQuerySimple } from '@/lib/database-simple'

export async function GET() {
  try {
    console.log('🔍 Probando todas las configuraciones de conexión...')
    
    // Probar todas las configuraciones
    const results = await testAllConnections()
    
    // Si alguna funcionó, probar una consulta
    let usuarios = []
    let usuarioNadia = []
    
    const successfulOption = results.find(r => r.success)
    if (successfulOption) {
      console.log('✅ Configuración exitosa encontrada, probando consultas...')
      
      // Probar consulta de usuarios
      usuarios = await executeQuerySimple(`
        SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
        FROM UsuariosLecturas 
        ORDER BY id
      `)
      
      // Buscar específicamente el usuario NadiaP
      usuarioNadia = await executeQuerySimple(`
        SELECT id, usuario, correo, nombres, apellidoPaterno, estatusUsuario, contraseña
        FROM UsuariosLecturas 
        WHERE usuario = 'NadiaP'
      `)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Prueba de conexiones completada',
      connectionResults: results,
      usuarios: usuarios,
      usuarioNadia: usuarioNadia,
      successfulConfig: successfulOption ? successfulOption.option : null
    })
    
  } catch (error) {
    console.error('❌ Error en la prueba de conexiones:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error en la prueba de conexiones',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
