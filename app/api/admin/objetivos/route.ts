// API: Obtener objetivos filtrados por empresa y gerencia (solo para administradores)

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      console.error('❌ [Admin Objetivos] No se encontró cookie de usuario')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    let user
    try {
      user = JSON.parse(userCookie.value)
    } catch (parseError) {
      console.error('❌ [Admin Objetivos] Error parseando cookie:', parseError)
      return NextResponse.json({ success: false, message: 'Error al leer datos de usuario' }, { status: 401 })
    }
    
    // Verificar que sea admin (rolUsuario === 1)
    if (user.rolUsuario !== 1) {
      return NextResponse.json({ 
        success: false, 
        message: 'No tienes permisos para acceder a esta información' 
      }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const empresaGerenciaParam = searchParams.get('empresaGerencia')
    const yearParam = searchParams.get('year')

    if (!empresaGerenciaParam || !yearParam) {
      return NextResponse.json({ 
        success: false, 
        message: 'Parámetros requeridos: empresaGerencia y year' 
      }, { status: 400 })
    }

    const empresaGerencia = parseInt(empresaGerenciaParam)
    const year = parseInt(yearParam)

    // Query: obtiene objetivos con valores mensuales para la empresa-gerencia especificada
    const query = `
      SELECT
          v.id_Variable,
          v.nombreVariable,
          ovh.id_Objetivo_Variable,
          ovh.periodo,
          ovh.valorObjetivo,
          ovh.observaciones_objetivo,
          veg.id_Variable_Empresa_Gerencia,
          vegh.valor as valorReal,
          YEAR(ovh.periodo) as anio,
          MONTH(ovh.periodo) as mes,
          eo.nombreEmpresaOperadora,
          g.nomGerencia,
          eo.claveEmpresaOperadora
      FROM INDICADORES.OBJETIVOS_VARIABLES_HECHOS AS ovh
      INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
          ON veg.id_Variable_Empresa_Gerencia = ovh.id_Variable_Empresa_Gerencia
      INNER JOIN INDICADORES.VARIABLES AS v
          ON v.id_Variable = veg.id_Variable
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
          ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      INNER JOIN dbo.EMPRESA_OPERADORA AS eo
          ON eo.idEmpresaOperadora = eg.id_Empresa
      INNER JOIN dbo.GERENCIAS AS g
          ON g.idGerencia = eg.id_Gerencia
      LEFT JOIN INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
          ON vegh.id_Variable_Empresa_Gerencia = veg.id_Variable_Empresa_Gerencia
          AND YEAR(vegh.periodo) = YEAR(ovh.periodo)
          AND MONTH(vegh.periodo) = MONTH(ovh.periodo)
      WHERE eg.id_Empresa_Gerencia = @empresaGerencia
        AND YEAR(ovh.periodo) = @year
      ORDER BY v.nombreVariable, MONTH(ovh.periodo)
    `

    const objetivos = await executeQuery(query, { empresaGerencia, year })

    // Obtener años con datos para esta empresa-gerencia
    const yearsQuery = `
      SELECT DISTINCT YEAR(ovh.periodo) as anio
      FROM INDICADORES.OBJETIVOS_VARIABLES_HECHOS AS ovh
      INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
          ON veg.id_Variable_Empresa_Gerencia = ovh.id_Variable_Empresa_Gerencia
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
          ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      WHERE eg.id_Empresa_Gerencia = @empresaGerencia
      ORDER BY anio DESC
    `
    const yearsData = await executeQuery(yearsQuery, { empresaGerencia })
    const years = yearsData.map((r: any) => r.anio)

    // Agrupar por variable y mes (similar a la API normal)
    const grouped: any = {}
    objetivos.forEach((row: any) => {
      const key = row.nombreVariable
      if (!grouped[key]) {
        grouped[key] = {
          id: row.id_Variable_Empresa_Gerencia?.toString() || row.id_Variable.toString(),
          nombre: row.nombreVariable,
          valoresMensuales: {},
          valoresReales: {},
          periodo: row.periodo,
          progreso: 0
        }
      }
      const mes = getMonthName(row.mes - 1)
      grouped[key].valoresMensuales[mes] = {
        valor: row.valorObjetivo !== null && row.valorObjetivo !== undefined ? row.valorObjetivo.toString() : '-',
        observaciones: row.observaciones_objetivo || null,
        idObjetivo: row.id_Objetivo_Variable
      }
      if (row.valorReal !== null && row.valorReal !== undefined) {
        grouped[key].valoresReales[mes] = row.valorReal.toString()
      }
    })

    const data = Object.values(grouped)

    return NextResponse.json({ success: true, data, years })
  } catch (error: any) {
    console.error('❌ Error obteniendo objetivos admin:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo objetivos', 
      error: error.message || String(error) 
    }, { status: 500 })
  }
}

function getMonthName(monthIndex: number): string {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  return months[monthIndex] || ""
}


