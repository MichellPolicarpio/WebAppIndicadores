import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Verificando usuarios en la base de datos...')
    
    // Consulta para obtener todos los usuarios
    const usuarios = await executeQuery(`
      SELECT 
        id, 
        usuario, 
        contraseña,
        correo, 
        nombres, 
        apellidoPaterno, 
        estatusUsuario,
        empresaOperadora,
        idEmpresa_Gerencia
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados en la BD:', usuarios)
    
    // Buscar específicamente usuarios activos
    const usuariosActivos = await executeQuery(`
      SELECT 
        id, 
        usuario, 
        contraseña,
        correo, 
        nombres, 
        apellidoPaterno, 
        estatusUsuario
      FROM UsuariosLecturas 
      WHERE estatusUsuario = 1
      ORDER BY id
    `)
    
    console.log('✅ Usuarios activos:', usuariosActivos)
    
    return NextResponse.json({
      success: true,
      message: 'Usuarios obtenidos de la base de datos',
      totalUsuarios: usuarios.length,
      usuariosActivos: usuariosActivos.length,
      todosLosUsuarios: usuarios,
      usuariosActivos: usuariosActivos
    })
    
  } catch (error) {
    console.error('❌ Error al obtener usuarios:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error al obtener usuarios',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
