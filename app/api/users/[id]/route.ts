// API: Actualizar datos de usuario

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

// Actualizar datos del usuario
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const id = parseInt(params.id)
    
    // Verificar que el usuario solo pueda actualizar sus propios datos
    if (user.id !== id) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permiso para actualizar este usuario' 
      }, { status: 403 })
    }

    const body = await req.json()
    const { nombres, apellidoPaterno, apellidoMaterno, correo } = body

    const query = `
      UPDATE dbo.UsuariosLecturas
      SET 
        nombres = @nombres,
        apellidoPaterno = @apellidoPaterno,
        apellidoMaterno = @apellidoMaterno,
        correo = @correo
      WHERE id = @id
    `

    await executeQuery(query, { 
      id, 
      nombres: nombres || null,
      apellidoPaterno: apellidoPaterno || null,
      apellidoMaterno: apellidoMaterno || null,
      correo: correo || null
    })

    // Actualizar cookie con nuevos datos
    const updatedUser = {
      ...user,
      nombres,
      apellidoPaterno,
      apellidoMaterno,
      correo,
      name: `${nombres || ''} ${apellidoPaterno || ''}`.trim() || user.usuario
    }

    const response = NextResponse.json({ 
      success: true, 
      message: 'Datos actualizados correctamente',
      user: updatedUser
    })

    // Actualizar cookie
    response.cookies.set('user', JSON.stringify(updatedUser), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })

    return response
  } catch (error: any) {
    console.error('❌ Error actualizando usuario:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error actualizando datos', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

