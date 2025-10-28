import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'

export async function GET() {
  try {
    console.log('🔍 Probando autenticación con consultas SQL reales...')
    
    // Probar consulta simple
    const testQuery = await executeQuery('SELECT 1 as test')
    console.log('✅ Consulta de prueba exitosa:', testQuery)
    
    // Probar consulta de usuarios
    const usuarios = await executeQuery(`
      SELECT TOP 5 id, usuario, correo, nombres, apellidoPaterno, estatusUsuario
      FROM UsuariosLecturas 
      ORDER BY id
    `)
    
    console.log('👥 Usuarios encontrados:', usuarios)
    
    // Probar consulta de autenticación específica
    const usuarioNadia = await executeQuery(`
      SELECT 
        id, 
        usuario, 
        correo, 
        nombres, 
        apellidoPaterno, 
        apellidoMaterno,
        empresaOperadora,
        idEmpresa_Gerencia,
        estatusUsuario,
        rolUsuario
      FROM UsuariosLecturas 
      WHERE usuario = @usuario
    `, ['NadiaP'])
    
    console.log('🔍 Usuario NadiaP encontrado:', usuarioNadia)
    
    // Probar consulta de autenticación completa
    const authTest = await executeQuery(`
      SELECT 
        id, 
        usuario, 
        correo, 
        nombres, 
        apellidoPaterno, 
        apellidoMaterno,
        empresaOperadora,
        idEmpresa_Gerencia,
        estatusUsuario,
        rolUsuario
      FROM UsuariosLecturas 
      WHERE usuario = @usuario 
        AND contraseña = @contraseña 
        AND estatusUsuario = 1
    `, ['NadiaP', '1234'])
    
    console.log('🔐 Prueba de autenticación:', authTest)
    
    return NextResponse.json({
      success: true,
      message: 'Consultas SQL reales ejecutadas exitosamente',
      test: testQuery,
      usuarios: usuarios,
      usuarioNadia: usuarioNadia,
      authTest: authTest
    })
    
  } catch (error) {
    console.error('❌ Error en las consultas SQL reales:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error en consultas SQL reales',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 })
  }
}
