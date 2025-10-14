import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { usuario, contraseña } = body

    if (!usuario || !contraseña) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Usuario y contraseña son requeridos' 
        },
        { status: 400 }
      )
    }

    // Autenticar usuario con la base de datos
    const user = await authenticateUser(usuario, contraseña)

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Credenciales incorrectas o usuario inactivo' 
        },
        { status: 401 }
      )
    }

    // Retornar datos del usuario (sin contraseña)
    const { contraseña: _, ...userWithoutPassword } = user

    return NextResponse.json({
      success: true,
      message: 'Login exitoso',
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Error en login:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error interno del servidor',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
