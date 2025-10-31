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

