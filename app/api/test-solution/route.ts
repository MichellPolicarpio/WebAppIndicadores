import { NextResponse } from 'next/server'
import { executeQuerySolution, testConnectionSolution } from '@/lib/database-solution'

export async function GET() {
  try {
    console.log('🔍 Probando solución de conexión...')
    
    // Probar conexión básica
    const isConnected = await testConnectionSolution()
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos')
    }
    
    console.log('✅ Conexión exitosa, probando consultas...')
    
    // Probar consulta de usuarios
    const usuarios = await executeQuerySolution(`
      SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados:', usuarios)
    
    // Buscar específicamente el usuario NadiaP
    const usuarioNadia = await executeQuerySolution(`
      SELECT id, usuario, correo, nombres, apellidoPaterno, estatusUsuario, contraseña
      FROM UsuariosLecturas 
      WHERE usuario = 'NadiaP'
    `)
    
    console.log('🔍 Usuario NadiaP:', usuarioNadia)
    
    return NextResponse.json({
      success: true,
      message: 'Solución de conexión exitosa',
      usuarios: usuarios,
      usuarioNadia: usuarioNadia,
      totalUsuarios: usuarios.length
    })
    
  } catch (error) {
    console.error('❌ Error en la solución:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error en la solución de conexión',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
