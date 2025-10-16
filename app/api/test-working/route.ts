import { NextResponse } from 'next/server'
import { executeQueryWorking } from '@/lib/database-working'

export async function GET() {
  try {
    console.log('🔍 Probando conexión con configuración que funciona...')
    
    // Probar consulta simple
    const result = await executeQueryWorking('SELECT 1 as test')
    console.log('✅ Consulta exitosa:', result)
    
    // Probar consulta de usuarios
    const usuarios = await executeQueryWorking(`
      SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados:', usuarios)
    
    // Buscar específicamente el usuario NadiaP
    const usuarioNadia = await executeQueryWorking(`
      SELECT id, usuario, correo, nombres, apellidoPaterno, estatusUsuario, contraseña
      FROM UsuariosLecturas 
      WHERE usuario = 'NadiaP'
    `)
    
    console.log('🔍 Usuario NadiaP:', usuarioNadia)
    
    return NextResponse.json({
      success: true,
      message: 'Conexión exitosa con nueva configuración',
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
