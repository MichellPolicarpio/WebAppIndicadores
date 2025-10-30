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
        const valoresMensualesInit: any = {}
        const valoresRealesInit: any = {}
        const mesesNombres = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']
        mesesNombres.forEach(m => {
          valoresMensualesInit[m] = { valor: '-', idObjetivo: null, observaciones: null, periodo: null }
          valoresRealesInit[m] = '-'
        })
        acc[variableId] = {
          id: variableId.toString(),
          nombre: row.nombreVariable,
          valorObjetivo: '-',
          valoresMensuales: valoresMensualesInit,
          valoresReales: valoresRealesInit,
          periodo: `${nombreMes} ${row.anio}`,
          progreso: 0,
        }
      }
      // Guardar valores mensuales con id (¡la clave!)
      acc[variableId].valoresMensuales[nombreMes] = {
        valor: row.valorObjetivo != null ? parseFloat(row.valorObjetivo).toFixed(2) : '-',
        idObjetivo: row.id_Objetivo_Variable,
        observaciones: row.observaciones_objetivo || null,
        periodo: row.periodo
      }
      // Guardar el último valor como valorObjetivo general (sólo display)
      if (row.valorObjetivo != null) {
        acc[variableId].valorObjetivo = parseFloat(row.valorObjetivo).toFixed(2)
      }
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

// POST: Crear objetivos anuales para una variable
export async function POST(req: NextRequest) {
  try {
    // Validar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    if (!user || !user.idEmpresa_Gerencia) {
      return NextResponse.json({ success: false, message: 'Usuario sin empresa asignada' }, { status: 401 })
    }

    const empresaGerencia = user.idEmpresa_Gerencia
    const body = await req.json()
    const { nombreVariable, year, valoresMensuales } = body

    // Validar datos requeridos
    if (!nombreVariable || !year || !valoresMensuales) {
      return NextResponse.json({ 
        success: false, 
        message: 'Faltan datos requeridos: nombreVariable, year, valoresMensuales' 
      }, { status: 400 })
    }

    console.log('📝 Creando objetivos para:', { nombreVariable, year, empresa: empresaGerencia })

    // Paso 1: Obtener id_Variable_Empresa_Gerencia
    const getVegQuery = `
      SELECT veg.id_Variable_Empresa_Gerencia
      FROM INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
      INNER JOIN INDICADORES.VARIABLES AS v
          ON v.id_Variable = veg.id_Variable
      INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
          ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
      WHERE v.nombreVariable = @nombreVariable
        AND eg.id_Empresa_Gerencia = @empresaGerencia
    `
    
    const vegResult = await executeQuery(getVegQuery, { nombreVariable, empresaGerencia })
    
    if (!vegResult || vegResult.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: `No se encontró la variable "${nombreVariable}" para esta empresa` 
      }, { status: 404 })
    }

    const idVariableEmpresaGerencia = vegResult[0].id_Variable_Empresa_Gerencia

    // Paso 2: Insertar objetivos para cada mes
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    
    let insertedCount = 0

    for (let i = 0; i < meses.length; i++) {
      const mes = meses[i]
      const valorData = valoresMensuales[mes]
      
      if (valorData && valorData.valor && valorData.valor.trim() !== '' && valorData.valor !== '-') {
        const periodo = `${year}-${String(i + 1).padStart(2, '0')}-01`
        const valor = parseFloat(valorData.valor)
        const observaciones = valorData.observaciones || null

        const insertQuery = `
          INSERT INTO INDICADORES.OBJETIVOS_VARIABLES_HECHOS
          (id_Variable_Empresa_Gerencia, periodo, valorObjetivo, observaciones_objetivo, fecha_Creacion, creado_Por)
          VALUES
          (@idVariableEmpresaGerencia, @periodo, @valor, @observaciones, GETDATE(), @creadoPor)
        `

        await executeQuery(insertQuery, {
          idVariableEmpresaGerencia,
          periodo,
          valor,
          observaciones,
          creadoPor: user.usuario || user.email || 'Sistema'
        })

        insertedCount++
      }
    }

    console.log(`✅ ${insertedCount} objetivos creados para ${nombreVariable} - ${year}`)

    return NextResponse.json({ 
      success: true, 
      message: `${insertedCount} objetivos creados exitosamente`,
      insertedCount
    })

  } catch (error: any) {
    console.error('❌ Error creando objetivos:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error creando objetivos', 
      error: error.message || String(error)
    }, { status: 500 })
  }
}

// PUT: Editar objetivo anual existente
export async function PUT(req: NextRequest) {
  try {
    // Validar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }
    const user = JSON.parse(userCookie.value)
    if (!user || !user.idEmpresa_Gerencia) {
      return NextResponse.json({ success: false, message: 'Usuario sin empresa asignada' }, { status: 401 })
    }

    // Recibir y LOGUEAR el payload recibido
    const body = await req.json()
    const updates = Array.isArray(body) ? body : [body]
    console.log('🔄 [PUT /api/objetivos] Payload recibido para actualizar:', JSON.stringify(updates, null, 2))

    let updatedCount = 0

    for (const upd of updates) {
      // Datos requeridos
      const { id_Objetivo_Variable, periodo, valorObjetivo, observaciones_objetivo } = upd
      if (!id_Objetivo_Variable || !periodo) {
        return NextResponse.json({
          success: false,
          message: 'Faltan datos requeridos: id_Objetivo_Variable y periodo'
        }, { status: 400 })
      }
      // Actualizar el registro
      const updateQuery = `
        UPDATE INDICADORES.OBJETIVOS_VARIABLES_HECHOS
        SET valorObjetivo = @valorObjetivo,
            observaciones_objetivo = @observaciones_objetivo,
            fecha_modificacion = GETDATE(),
            modificado_por = @modificado_por
        WHERE id_Objetivo_Variable = @id_Objetivo_Variable AND periodo = @periodo
      `
      await executeQuery(updateQuery, {
        valorObjetivo: valorObjetivo !== undefined && valorObjetivo !== null && valorObjetivo !== '-' ? valorObjetivo : null,
        observaciones_objetivo: observaciones_objetivo || null,
        id_Objetivo_Variable,
        periodo,
        modificado_por: user.usuario || user.email || 'Sistema'
      })
      updatedCount++
    }

    return NextResponse.json({ success: true, message: `${updatedCount} objetivo(s) actualizado(s)` })

  } catch (error: any) {
    console.error('❌ Error editando objetivo:', error)
    return NextResponse.json({
      success: false,
      message: 'Error editando objetivo',
      error: error.message || String(error)
    }, { status: 500 })
  }
}

