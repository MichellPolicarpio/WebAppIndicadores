// API: Editar y eliminar variables por ID

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

// Eliminar registro de variable
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const id = parseInt(params.id)

    const query = `
      DELETE FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS
      WHERE id_Variable_EmpresaGerencia_Hechos = @id
    `

    await executeQuery(query, { id })

    return NextResponse.json({ success: true, message: 'Variable eliminada exitosamente' })
  } catch (error: any) {
    console.error('❌ Error eliminando variable:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error eliminando variable', 
      error: String(error) 
    }, { status: 500 })
  }
}

// Actualizar valor de variable
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const id = parseInt(params.id)
    const body = await req.json()
    const { valor, observaciones_Periodo } = body

    if (valor === undefined || valor === null) {
      return NextResponse.json({ 
        success: false, 
        message: 'El valor es requerido' 
      }, { status: 400 })
    }

    const query = `
      UPDATE INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS
      SET valor = @valor,
          observaciones_Periodo = @observaciones_Periodo,
          fecha_Modificacion = GETDATE(),
          modificado_Por = @modificadoPor
      WHERE id_Variable_EmpresaGerencia_Hechos = @id
    `

    await executeQuery(query, { 
      id, 
      valor, 
      observaciones_Periodo: observaciones_Periodo || null,
      modificadoPor: user.usuario || user.email 
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Variable actualizada exitosamente' 
    })
  } catch (error: any) {
    console.error('❌ Error actualizando variable:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error actualizando variable', 
      error: String(error) 
    }, { status: 500 })
  }
}

