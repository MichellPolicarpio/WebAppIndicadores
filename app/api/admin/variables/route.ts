// API: Obtener variables filtradas por empresa y gerencia (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    console.log('🔍 [Admin Variables] Verificando autenticación...')
    console.log('🔍 [Admin Variables] Cookie encontrada:', userCookie ? 'Sí' : 'No')
    
    // Intentar leer todas las cookies para debug
    const allCookies = cookieStore.getAll()
    console.log('🍪 [Admin Variables] Todas las cookies disponibles:', allCookies.map(c => c.name))
    
    if (!userCookie?.value) {
      console.error('❌ [Admin Variables] No se encontró cookie de usuario')
      console.error('❌ [Admin Variables] Cookies disponibles:', allCookies)
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }
    
    console.log('✅ [Admin Variables] Cookie encontrada, valor (primeros 50 chars):', userCookie.value.substring(0, 50))

    let user
    try {
      user = JSON.parse(userCookie.value)
      console.log('👤 [Admin Variables] Usuario parseado:', { id: user?.id, usuario: user?.usuario, rolUsuario: user?.rolUsuario })
    } catch (parseError) {
      console.error('❌ [Admin Variables] Error parseando cookie:', parseError)
      return NextResponse.json({ success: false, message: 'Error al leer datos de usuario' }, { status: 401 })
    }
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      console.warn('⚠️ [Admin Variables] Usuario no es admin. rolUsuario:', user.rolUsuario)
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para acceder a esta información' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const empresaGerenciaParam = searchParams.get('empresaGerencia')
    const yearParam = searchParams.get('year')
    const monthParam = searchParams.get('month')

    if (!empresaGerenciaParam) {
      return NextResponse.json({ 
        success: false, 
        message: 'Parámetro empresaGerencia es requerido' 
      }, { status: 400 })
    }

    const empresaGerencia = parseInt(empresaGerenciaParam)
    let year = yearParam ? parseInt(yearParam) : new Date().getFullYear()
    let month = monthParam ? parseInt(monthParam) : new Date().getMonth() + 1

    // Consulta basada en la referencia del usuario
    const query = `
      SELECT
        vegh.id_Variable_EmpresaGerencia_Hechos,  
        vegh.id_Variable_Empresa_Gerencia,        
        eg.id_Empresa_Gerencia,       
        g.nomGerencia,
        v.id_Variable,                           
        v.nombreVariable,                         
        vegh.periodo,                             
        vegh.valor,                               
        vegh.observaciones_Periodo,               
        eo.nombreEmpresaOperadora,
        eo.claveEmpresaOperadora
      FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
      INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
        ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
      INNER JOIN INDICADORES.VARIABLES AS v
        ON v.id_Variable = veg.id_Variable
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
        ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      INNER JOIN dbo.EMPRESA_OPERADORA AS eo
        ON eo.idEmpresaOperadora = eg.id_Empresa
      INNER JOIN dbo.GERENCIAS AS g
        ON g.idGerencia = eg.id_Gerencia
      WHERE eg.id_Empresa_Gerencia = @empresaGerenciaParam
        AND YEAR(vegh.periodo) = @yearParam
        AND MONTH(vegh.periodo) = @monthParam
      ORDER BY v.nombreVariable
    `

    const data = await executeQuery(query, {
      empresaGerenciaParam: empresaGerencia,
      yearParam: year,
      monthParam: month
    })

    // Obtener períodos disponibles para esta empresa-gerencia
    const periodosQuery = `
      SELECT DISTINCT vegh.periodo
      FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
      INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
        ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
        ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      WHERE eg.id_Empresa_Gerencia = @empresaGerenciaParam
      ORDER BY vegh.periodo DESC
    `
    
    const periodosData = await executeQuery(periodosQuery, { empresaGerenciaParam: empresaGerencia })
    const periodos = periodosData.map((r: any) => r.periodo)

    return NextResponse.json({ success: true, data, periodos })

  } catch (error: any) {
    console.error('❌ Error obteniendo variables admin:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo variables', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

