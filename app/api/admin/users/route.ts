// API: Obtener todos los usuarios (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para acceder a esta información' 
      }, { status: 403 })
    }

    // Consulta completa de usuarios con información de empresa, gerencia y rol
    const query = `
      SELECT 
        ul.id,
        ul.usuario,
        ul.correo,
        ul.nombres,
        ul.apellidoPaterno,
        ul.apellidoMaterno,
        ul.estatusUsuario,
        ul.rolUsuario,
        ul.empresaOperadora,
        ul.idEmpresa_Gerencia,
        ul.fechaCreacion,
        ru.rolUsuario AS nombreRol,
        ru.descripccion AS descripcionRol,
        eo.nombreEmpresaOperadora,
        eg.clave_Empresa_Gerencia,
        g.nomGerencia
      FROM UsuariosLecturas ul
      LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
      LEFT JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia
      LEFT JOIN EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
      LEFT JOIN GERENCIAS g ON g.idGerencia = eg.id_Gerencia
      ORDER BY ul.fechaCreacion DESC, ul.usuario ASC
    `

    const usuarios = await executeQuery(query)

    // Formatear datos para el frontend
    const usuariosFormateados = usuarios.map((u: any) => ({
      id: u.id,
      usuario: u.usuario,
      correo: u.correo || '',
      nombres: u.nombres || '',
      apellidoPaterno: u.apellidoPaterno || '',
      apellidoMaterno: u.apellidoMaterno || '',
      nombreCompleto: `${u.nombres || ''} ${u.apellidoPaterno || ''} ${u.apellidoMaterno || ''}`.trim() || u.usuario,
      estatusUsuario: u.estatusUsuario ?? 0,
      esActivo: u.estatusUsuario === 1,
      rolUsuario: u.rolUsuario ?? null,
      nombreRol: u.nombreRol || 'Sin rol',
      descripcionRol: u.descripcionRol || '',
      empresaOperadora: u.empresaOperadora ?? null,
      nombreEmpresa: u.nombreEmpresaOperadora || (u.rolUsuario === 1 ? 'Administración' : 'Sin empresa'),
      idEmpresa_Gerencia: u.idEmpresa_Gerencia ?? null,
      gerencia: u.nomGerencia || (u.rolUsuario === 1 ? 'Administración' : 'Sin gerencia'),
      fechaCreacion: u.fechaCreacion || null
    }))

    return NextResponse.json({
      success: true,
      usuarios: usuariosFormateados,
      total: usuariosFormateados.length,
      activos: usuariosFormateados.filter((u: any) => u.esActivo).length,
      inactivos: usuariosFormateados.filter((u: any) => !u.esActivo).length
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo usuarios:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error al obtener usuarios', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

// Crear nuevo usuario (solo para administradores)
export async function POST(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para crear usuarios' 
      }, { status: 403 })
    }

    const body = await req.json()
    const { 
      usuario, 
      contraseña, 
      nombres, 
      apellidoPaterno, 
      apellidoMaterno, 
      correo, 
      rolUsuario, 
      estatusUsuario,
      idEmpresa_Gerencia
    } = body

    // Validaciones
    if (!usuario || !contraseña || !rolUsuario) {
      return NextResponse.json({ 
        success: false, 
        message: 'Usuario, contraseña y rol son campos requeridos' 
      }, { status: 400 })
    }

    // Validar que el usuario no exista
    const usuarioExistente = await executeQuery(
      'SELECT id FROM UsuariosLecturas WHERE usuario = @usuario',
      { usuario }
    )

    if (usuarioExistente && usuarioExistente.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'El usuario ya existe' 
      }, { status: 400 })
    }

    // Convertir valores
    const rolUsuarioNum = parseInt(rolUsuario)
    const estatusUsuarioNum = estatusUsuario !== undefined ? parseInt(estatusUsuario) : 1
    const idEmpresa_GerenciaNum = idEmpresa_Gerencia ? parseInt(idEmpresa_Gerencia) : null

    // Si es admin (rolUsuario === 1), idEmpresa_Gerencia puede ser NULL
    // Si no es admin, idEmpresa_Gerencia es requerido
    if (rolUsuarioNum !== 1 && !idEmpresa_GerenciaNum) {
      return NextResponse.json({ 
        success: false, 
        message: 'La empresa/gerencia es requerida para usuarios no administradores' 
      }, { status: 400 })
    }

    // Obtener empresaOperadora si hay idEmpresa_Gerencia
    let empresaOperadora = null
    if (idEmpresa_GerenciaNum) {
      const empresaData = await executeQuery(
        `SELECT id_Empresa FROM INDICADORES.EMPRESA_GERENCIA WHERE id_Empresa_Gerencia = @idEmpresa_Gerencia`,
        { idEmpresa_Gerencia: idEmpresa_GerenciaNum }
      )
      if (empresaData && empresaData.length > 0) {
        empresaOperadora = empresaData[0].id_Empresa
      }
    }

    // Insertar nuevo usuario
    const insertQuery = `
      INSERT INTO UsuariosLecturas 
        (usuario, contraseña, nombres, apellidoPaterno, apellidoMaterno, correo, 
         rolUsuario, estatusUsuario, idEmpresa_Gerencia, empresaOperadora, 
         ruta, fechaCreacion)
      VALUES 
        (@usuario, @contraseña, @nombres, @apellidoPaterno, @apellidoMaterno, @correo,
         @rolUsuario, @estatusUsuario, @idEmpresa_Gerencia, @empresaOperadora,
         1, GETDATE())
    `

    await executeQuery(insertQuery, {
      usuario,
      contraseña,
      nombres: nombres || null,
      apellidoPaterno: apellidoPaterno || null,
      apellidoMaterno: apellidoMaterno || null,
      correo: correo || null,
      rolUsuario: rolUsuarioNum,
      estatusUsuario: estatusUsuarioNum,
      idEmpresa_Gerencia: idEmpresa_GerenciaNum,
      empresaOperadora: empresaOperadora
    })

    // Obtener el usuario creado para retornarlo
    const nuevoUsuarioQuery = `
      SELECT
        ul.id,
        ul.usuario,
        ul.correo,
        ul.nombres,
        ul.apellidoPaterno,
        ul.apellidoMaterno,
        ul.estatusUsuario,
        ul.rolUsuario,
        ul.empresaOperadora,
        ul.idEmpresa_Gerencia,
        ul.fechaCreacion,
        ru.rolUsuario AS nombreRol,
        ru.descripccion AS descripcionRol,
        eo.nombreEmpresaOperadora,
        eg.clave_Empresa_Gerencia,
        g.nomGerencia
      FROM UsuariosLecturas ul
      LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
      LEFT JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia
      LEFT JOIN EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
      LEFT JOIN GERENCIAS g ON g.idGerencia = eg.id_Gerencia
      WHERE ul.usuario = @usuario
    `

    const nuevoUsuario = await executeQuery(nuevoUsuarioQuery, { usuario })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado correctamente',
      user: nuevoUsuario[0] || null
    })

  } catch (error: any) {
    console.error('❌ Error creando usuario:', error)
    return NextResponse.json({
      success: false,
      message: 'Error creando usuario',
      error: error.message || String(error)
    }, { status: 500 })
  }
}

