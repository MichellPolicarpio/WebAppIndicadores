// API: Obtener objetivos de variables

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Validar autenticación desde cookies
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      console.error('❌ No se encontró cookie de usuario')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    // console.log('👤 Usuario desde cookie:', { id: user.id, empresa: user.idEmpresa_Gerencia })
    
    if (!user || !user.idEmpresa_Gerencia) {
      console.error('❌ Usuario sin empresa asignada')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const empresaGerencia = user.idEmpresa_Gerencia
    
    // Obtener parámetro de año de la URL
    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get('year')
    
    // console.log('🔍 Buscando objetivos para empresa-gerencia:', empresaGerencia)
    // console.log('📅 Año solicitado:', yearParam)

    // Query: obtiene objetivos con valores mensuales
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
          MONTH(ovh.periodo) as mes
      FROM INDICADORES.OBJETIVOS_VARIABLES_HECHOS AS ovh
      INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
          ON veg.id_Variable_Empresa_Gerencia = ovh.id_Variable_Empresa_Gerencia
      INNER JOIN INDICADORES.VARIABLES AS v
          ON v.id_Variable = veg.id_Variable
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
          ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      LEFT JOIN INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
          ON vegh.id_Variable_Empresa_Gerencia = veg.id_Variable_Empresa_Gerencia
          AND YEAR(vegh.periodo) = YEAR(ovh.periodo)
          AND MONTH(vegh.periodo) = MONTH(ovh.periodo)
      WHERE eg.id_Empresa_Gerencia = @empresaGerenciaParam
          ${yearParam ? 'AND YEAR(ovh.periodo) = @yearParam' : ''}
      ORDER BY v.nombreVariable, ovh.periodo
    `
    
    const params: any = { empresaGerenciaParam: empresaGerencia }
    if (yearParam) {
      params.yearParam = parseInt(yearParam)
    }
    
    const data = await executeQuery(query, params)

    // console.log('✅ Objetivos obtenidos:', data?.length || 0)

    // Agrupar datos por variable
    const objetivosAgrupados = (data || []).reduce((acc: any, row: any) => {
      const variableId = row.id_Variable
      const mes = row.mes
      const nombreMes = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'][mes - 1]
      
      if (!acc[variableId]) {
        // Inicializar con todos los meses en "-"
        const valoresMensualesInit: any = {}
        const valoresRealesInit: any = {}
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
        mesesNombres.forEach(m => {
          valoresMensualesInit[m] = '-'  // Objetivos
          valoresRealesInit[m] = '-'      // Valores reales
        })
        
        acc[variableId] = {
          id: variableId.toString(),
          nombre: row.nombreVariable,
          valorObjetivo: '-',
          valoresMensuales: valoresMensualesInit,  // Objetivos por mes
          valoresReales: valoresRealesInit,         // Valores reales por mes
          periodo: `${nombreMes} ${row.anio}`,
          progreso: 0,
        }
      }
      
      // Agregar valor objetivo mensual
      if (row.valorObjetivo != null) {
        acc[variableId].valoresMensuales[nombreMes] = parseFloat(row.valorObjetivo).toFixed(2)
        // Guardar también como valorObjetivo general (usar el último o promedio)
        acc[variableId].valorObjetivo = parseFloat(row.valorObjetivo).toFixed(2)
      }
      
      // Agregar valor real mensual
      if (row.valorReal != null) {
        acc[variableId].valoresReales[nombreMes] = parseFloat(row.valorReal).toFixed(2)
      }
      
      return acc
    }, {})

    // Convertir objeto a array
    const objetivos = Object.values(objetivosAgrupados)

    // Obtener años disponibles (solo si hay datos)
    let years: number[] = []
    try {
      const yearsQuery = `
        SELECT DISTINCT YEAR(ovh.periodo) as anio
        FROM INDICADORES.OBJETIVOS_VARIABLES_HECHOS AS ovh
        INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
            ON veg.id_Variable_Empresa_Gerencia = ovh.id_Variable_Empresa_Gerencia
        INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
            ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
        WHERE eg.id_Empresa_Gerencia = @empresaGerenciaParam
        ORDER BY anio DESC
      `
      
      const yearsData = await executeQuery(yearsQuery, { empresaGerenciaParam: empresaGerencia })
      years = (yearsData || []).map((r: any) => r.anio)
      // console.log('✅ Años con datos:', years)
    } catch (yearError) {
      console.error('⚠️ Error obteniendo años (continuando):', yearError)
      // Continuar sin años si falla esta query
    }

    return NextResponse.json({ success: true, data: objetivos, years })
  } catch (error: any) {
    console.error('❌ Error obteniendo objetivos:', error)
    console.error('Detalle completo:', error.message, error.stack)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo objetivos', 
      error: error.message || String(error),
      details: error.toString()
    }, { status: 500 })
  }
}

