// API: Actualizar usuario (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        message: 'No tienes permisos para realizar esta acción' 
      }, { status: 403 })
    }

    const id = parseInt(params.id)
    const body = await req.json()
    const { nombres, apellidoPaterno, apellidoMaterno, correo, rolUsuario, estatusUsuario } = body

    // Validar que rolUsuario y estatusUsuario sean números válidos
    const rolUsuarioNum = rolUsuario ? parseInt(rolUsuario) : null
    const estatusUsuarioNum = estatusUsuario ? parseInt(estatusUsuario) : null

    if (estatusUsuarioNum !== null && estatusUsuarioNum !== 0 && estatusUsuarioNum !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'Estado de usuario inválido (debe ser 0 o 1)' 
      }, { status: 400 })
    }

    // Construir la consulta de actualización dinámicamente
    const updates: string[] = []
    const queryParams: any = { id }

    if (nombres !== undefined) {
      updates.push('nombres = @nombres')
      queryParams.nombres = nombres || null
    }
    if (apellidoPaterno !== undefined) {
      updates.push('apellidoPaterno = @apellidoPaterno')
      queryParams.apellidoPaterno = apellidoPaterno || null
    }
    if (apellidoMaterno !== undefined) {
      updates.push('apellidoMaterno = @apellidoMaterno')
      queryParams.apellidoMaterno = apellidoMaterno || null
    }
    if (correo !== undefined) {
      updates.push('correo = @correo')
      queryParams.correo = correo || null
    }
    if (rolUsuarioNum !== null && rolUsuarioNum !== undefined) {
      updates.push('rolUsuario = @rolUsuario')
      queryParams.rolUsuario = rolUsuarioNum
    }
    if (estatusUsuarioNum !== null && estatusUsuarioNum !== undefined) {
      updates.push('estatusUsuario = @estatusUsuario')
      queryParams.estatusUsuario = estatusUsuarioNum
    }

    if (updates.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No se proporcionaron datos para actualizar' 
      }, { status: 400 })
    }

    const query = `
      UPDATE dbo.UsuariosLecturas
      SET ${updates.join(', ')}
      WHERE id = @id
    `

    await executeQuery(query, queryParams)

    // Obtener el usuario actualizado
    const updatedUserQuery = `
      SELECT 
        ul.id,
        ul.usuario,
        ul.correo,
        ul.nombres,
        ul.apellidoPaterno,
        ul.apellidoMaterno,
        ul.estatusUsuario,
        ul.rolUsuario,
        ru.rolUsuario AS nombreRol
      FROM UsuariosLecturas ul
      LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
      WHERE ul.id = @id
    `
    const updatedUser = await executeQuery(updatedUserQuery, { id })

    return NextResponse.json({ 
      success: true, 
      message: 'Usuario actualizado correctamente',
      user: updatedUser[0] || null
    })

  } catch (error: any) {
    console.error('❌ Error actualizando usuario:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error actualizando usuario', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

