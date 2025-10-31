// API: Obtener gerencias de una empresa (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      console.error('❌ [Admin Gerencias] No se encontró cookie de usuario')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    let user
    try {
      user = JSON.parse(userCookie.value)
    } catch (parseError) {
      console.error('❌ [Admin Gerencias] Error parseando cookie:', parseError)
      return NextResponse.json({ success: false, message: 'Error al leer datos de usuario' }, { status: 401 })
    }
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para acceder a esta información' 
      }, { status: 403 })
    }

    // Obtener parámetro de empresa
    const { searchParams } = new URL(req.url)
    const empresaId = searchParams.get('empresaId')

    if (!empresaId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Parámetro empresaId es requerido' 
      }, { status: 400 })
    }

    // Consulta para obtener gerencias de la empresa especificada
    const query = `
      SELECT DISTINCT
        eg.id_Empresa_Gerencia,
        eg.clave_Empresa_Gerencia,
        g.nomGerencia,
        eo.nombreEmpresaOperadora,
        eo.claveEmpresaOperadora
      FROM INDICADORES.EMPRESA_GERENCIA eg
      INNER JOIN dbo.GERENCIAS g ON g.idGerencia = eg.id_Gerencia
      INNER JOIN dbo.EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
      WHERE eg.id_Empresa = @empresaId
      ORDER BY g.nomGerencia
    `

    const gerencias = await executeQuery(query, { empresaId: parseInt(empresaId) })

    return NextResponse.json({
      success: true,
      gerencias: gerencias || []
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo gerencias:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error al obtener gerencias', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

