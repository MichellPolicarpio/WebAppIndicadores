// API: Obtener todas las empresas (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      console.error('❌ [Admin Empresas] No se encontró cookie de usuario')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    let user
    try {
      user = JSON.parse(userCookie.value)
    } catch (parseError) {
      console.error('❌ [Admin Empresas] Error parseando cookie:', parseError)
      return NextResponse.json({ success: false, message: 'Error al leer datos de usuario' }, { status: 401 })
    }
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para acceder a esta información' 
      }, { status: 403 })
    }

    // Consulta para obtener todas las empresas
    const query = `
      SELECT DISTINCT
        eo.idEmpresaOperadora,
        eo.claveEmpresaOperadora,
        eo.nombreEmpresaOperadora
      FROM dbo.EMPRESA_OPERADORA eo
      INNER JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa = eo.idEmpresaOperadora
      ORDER BY eo.nombreEmpresaOperadora
    `

    const empresas = await executeQuery(query)

    return NextResponse.json({
      success: true,
      empresas: empresas || []
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo empresas:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error al obtener empresas', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

