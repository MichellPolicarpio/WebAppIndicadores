import { NextResponse } from 'next/server'
import { executeQueryAlt } from '@/lib/database-alt'

export async function GET() {
  try {
    console.log('🔍 Probando conexión alternativa a la base de datos...')
    
    // Probar consulta simple
    const result = await executeQueryAlt('SELECT 1 as test')
    console.log('✅ Consulta exitosa:', result)
    
    // Probar consulta de usuarios
    const usuarios = await executeQueryAlt(`
      SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados:', usuarios)
    
    // Buscar específicamente el usuario NadiaP
    const usuarioNadia = await executeQueryAlt(`
      SELECT id, usuario, correo, nombres, apellidoPaterno, estatusUsuario, contraseña
      FROM UsuariosLecturas 
      WHERE usuario = 'NadiaP'
    `)
    
    console.log('🔍 Usuario NadiaP:', usuarioNadia)
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa',
      test: result,
      usuarios: usuarios,
      usuarioNadia: usuarioNadia
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
