// API: Cambiar contraseña de usuario

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const body = await req.json()
    const { currentPassword, newPassword } = body

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Contraseña actual y nueva contraseña son requeridas' 
      }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'La nueva contraseña debe tener al menos 6 caracteres' 
      }, { status: 400 })
    }

    // Detectar nombre real de la columna de contraseña ("contraseña" vs "contrasena")
    const columnCheck = await executeQuery(
      `SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('dbo.UsuariosLecturas') AND name IN (N'contraseña', N'contrasena')`
    )

    const pwdColumn: string = columnCheck?.[0]?.name || 'contraseña'

    // Obtener contraseña almacenada y comparar en código (tolerante a espacios)
    const getPwdQuery = `
      SELECT LTRIM(RTRIM(${pwdColumn})) AS pwd, estatusUsuario
      FROM dbo.UsuariosLecturas
      WHERE id = @id
    `

    const rows = await executeQuery(getPwdQuery, { id: user.id })
    const storedPwd = rows?.[0]?.pwd ?? null

    if (storedPwd === null) {
      return NextResponse.json({ success: false, message: 'No se encontró el usuario' }, { status: 404 })
    }

    if ((storedPwd || '') !== (String(currentPassword || '').trim())) {
      return NextResponse.json({ success: false, message: 'La contraseña actual es incorrecta' }, { status: 400 })
    }

    // Actualizar contraseña
    const updateQuery = `
      UPDATE dbo.UsuariosLecturas 
      SET ${pwdColumn} = @newPassword
      WHERE id = @id
    `

    await executeQuery(updateQuery, { id: user.id, newPassword })

    return NextResponse.json({ 
      success: true, 
      message: 'Contraseña actualizada correctamente' 
    })

  } catch (error: any) {
    console.error('❌ Error cambiando contraseña:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error actualizando contraseña', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}
