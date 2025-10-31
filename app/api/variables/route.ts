// API: Obtener variables del último periodo

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
    console.log('👤 Usuario desde cookie:', { id: user.id, empresa: user.idEmpresa_Gerencia })
    
    if (!user || !user.idEmpresa_Gerencia) {
      console.error('❌ Usuario sin empresa asignada')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const empresaGerencia = user.idEmpresa_Gerencia
    
    // Obtener parámetro de mes de la URL
    const { searchParams } = new URL(req.url)
    const monthParam = searchParams.get('month')
    
    console.log('🔍 Buscando variables para empresa-gerencia:', empresaGerencia)
    console.log('📅 Mes solicitado:', monthParam)

    // Query: obtiene variables del mes específico o el último periodo si no se especifica mes
    let query: string
    let params: any

    if (monthParam) {
      // Si se especifica un mes, buscar variables de ese mes específico
      // Parseo robusto de YYYY-MM sin depender de Date para evitar TZ
      const match = monthParam.match(/^(\d{4})-(\d{2})-/)
      if (!match) {
        return NextResponse.json({ success: false, message: 'Parámetro month inválido' }, { status: 400 })
      }
      const yearFromParam = parseInt(match[1], 10)
      const monthFromParam = parseInt(match[2], 10)

      query = `
        SELECT
            vegh.id_Variable_EmpresaGerencia_Hechos,
            vegh.id_Variable_Empresa_Gerencia,
            eg.id_Empresa_Gerencia,
            v.id_Variable,
            v.nombreVariable,
            vegh.periodo,
            vegh.valor,
            vegh.observaciones_Periodo,
            eo.nombreEmpresaOperadora
        FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
        INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
            ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
        INNER JOIN INDICADORES.VARIABLES AS v
            ON v.id_Variable = veg.id_Variable
        INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
            ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
        INNER JOIN dbo.EMPRESA_OPERADORA AS eo
            ON eo.idEmpresaOperadora = eg.id_Empresa
        WHERE eg.id_Empresa_Gerencia = @empresaGerenciaParam
          AND YEAR(vegh.periodo) = @yearParam
          AND MONTH(vegh.periodo) = @monthParam
        ORDER BY v.nombreVariable;
      `
      params = { 
        empresaGerenciaParam: empresaGerencia,
        yearParam: yearFromParam,
        monthParam: monthFromParam
      }
    } else {
      // Si no se especifica mes, usar el comportamiento original (último periodo)
      query = `
        DECLARE 
            @empresaGerencia           INT  = @empresaGerenciaParam,
            @fechaPeriodo              DATE 
        
        SET @fechaPeriodo = (
          SELECT MAX(vegh.Periodo)
          FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
          INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
            ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
          INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
            ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
          WHERE eg.id_Empresa_Gerencia = @empresaGerencia
        )

        SELECT
            vegh.id_Variable_EmpresaGerencia_Hechos,
            vegh.id_Variable_Empresa_Gerencia,
            eg.id_Empresa_Gerencia,
            v.id_Variable,
            v.nombreVariable,
            vegh.periodo,
            vegh.valor,
            vegh.observaciones_Periodo,
            eo.nombreEmpresaOperadora
        FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
        INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
            ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
        INNER JOIN INDICADORES.VARIABLES AS v
            ON v.id_Variable = veg.id_Variable
        INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
            ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
        INNER JOIN dbo.EMPRESA_OPERADORA AS eo
            ON eo.idEmpresaOperadora = eg.id_Empresa
        WHERE eg.id_Empresa_Gerencia = @empresaGerencia
          AND vegh.periodo = @fechaPeriodo
        ORDER BY v.nombreVariable;
      `
      params = { empresaGerenciaParam: empresaGerencia }
    }
    const data = await executeQuery(query, params)

    console.log('✅ Variables obtenidas:', data.length)

    // Obtener todos los períodos disponibles para el selector de meses
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
    console.error('❌ Error obteniendo variables:', error)
    console.error('Detalle completo:', error.message, error.stack)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo variables', 
      error: error.message || String(error),
      details: error.toString()
    }, { status: 500 })
  }
}

// Crear nueva variable
export async function POST(req: NextRequest) {
  try {
    // Validar autenticación desde cookies
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    if (!userCookie?.value) {
      console.error('❌ No se encontró cookie de usuario')
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }
    const user = JSON.parse(userCookie.value)
    console.log('👤 Usuario desde cookie:', { id: user.id, empresa: user.idEmpresa_Gerencia })
    if (!user || !user.idEmpresa_Gerencia) {
      console.error('❌ Usuario sin empresa asignada')
      return NextResponse.json({ success: false, message: 'Usuario sin empresa asignada' }, { status: 401 })
    }
    const body = await req.json()
    const { 
      id_Variable_Empresa_Gerencia, 
      periodo, 
      valor, 
      creado_Por, 
      observaciones_Periodo,
      validadorDeInsercion 
    } = body
    if (!id_Variable_Empresa_Gerencia || !periodo || valor === undefined || !creado_Por) {
      console.error('❌ POST faltan campos', {
        id_Variable_Empresa_Gerencia, periodo, valor, creado_Por
      })
      return NextResponse.json({ success: false, message: 'Faltan campos requeridos' }, { status: 400 })
    }
    console.log('[INSERT payload]', {
      id_Variable_Empresa_Gerencia, periodo, valor, creado_Por, observaciones_Periodo, validadorDeInsercion
    })

    // Normalizar periodo a primer día del mes en SQL y hacer UPSERT (update si ya existe ese id+mes)
    const upsertQuery = `
      DECLARE @y INT = YEAR(@periodo);
      DECLARE @m INT = MONTH(@periodo);
      DECLARE @p DATE = DATEFROMPARTS(@y, @m, 1);

      IF EXISTS (
        SELECT 1 FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS
        WHERE id_Variable_Empresa_Gerencia = @id_Variable_Empresa_Gerencia
          AND YEAR(periodo) = @y AND MONTH(periodo) = @m
      )
      BEGIN
        UPDATE INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS
        SET valor = @valor,
            observaciones_Periodo = @observaciones_Periodo,
            fecha_Modificacion = GETDATE(),
            modificado_Por = @creado_Por
        WHERE id_Variable_Empresa_Gerencia = @id_Variable_Empresa_Gerencia
          AND YEAR(periodo) = @y AND MONTH(periodo) = @m;
      END
      ELSE
      BEGIN
      INSERT INTO INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS
          (id_Variable_Empresa_Gerencia, periodo, valor, fecha_Creacion, creado_Por, observaciones_Periodo, validadorDeInsercion)
      VALUES 
          (@id_Variable_Empresa_Gerencia, @p, @valor, GETDATE(), @creado_Por, @observaciones_Periodo, @validadorDeInsercion);
      END;

      SELECT TOP 1
        vegh.id_Variable_EmpresaGerencia_Hechos,
        vegh.id_Variable_Empresa_Gerencia,
        vegh.periodo,
        vegh.valor,
        vegh.observaciones_Periodo
      FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS vegh
      WHERE vegh.id_Variable_Empresa_Gerencia = @id_Variable_Empresa_Gerencia
        AND YEAR(vegh.periodo) = @y AND MONTH(vegh.periodo) = @m
      ORDER BY vegh.id_Variable_EmpresaGerencia_Hechos DESC;
    `

    let insertedRows: any[] = []
    try {
      insertedRows = await executeQuery(upsertQuery, {
      id_Variable_Empresa_Gerencia,
      periodo,
      valor,
      creado_Por,
      observaciones_Periodo: observaciones_Periodo || null,
      validadorDeInsercion: validadorDeInsercion || null
    })
    } catch (sqlError) {
      let msg = 'Error creando/actualizando variable';
      if (sqlError.message && sqlError.message.match(/duplicate|unique|constraint/gi)) {
        msg = 'Ya existe una variable de ese tipo para ese mes (duplicado) o hay conflicto de datos.';
      }
      console.error('❌ SQL ERROR UPSERT variable:', sqlError)
      return NextResponse.json({
        success: false,
        message: msg,
        error: sqlError.message
      }, { status: 400 })
    }

    console.log('✅ UPSERT OK, registro:', insertedRows?.[0])

    return NextResponse.json({ 
      success: true, 
      message: 'Variable creada/actualizada exitosamente',
      row: insertedRows?.[0] || null
    })
  } catch (error: any) {
    console.error('❌ Error creando variable POST:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error creando variable', 
      error: error.message || String(error)
    }, { status: 500 })
  }
}


