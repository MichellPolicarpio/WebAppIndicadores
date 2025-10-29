import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Probar consulta simple
    const result = await executeQuery('SELECT 1 as test')
    console.log('✅ Consulta exitosa:', result)
    
    // Probar consulta de usuarios
    const usuarios = await executeQuery(`
      SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados:', usuarios)
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa',
      test: result,
      usuarios: usuarios
    })
    
  } catch (error) {
    console.error('❌ Error en la conexión:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error de conexión',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
