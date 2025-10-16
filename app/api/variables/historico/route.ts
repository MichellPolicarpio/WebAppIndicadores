import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Obtener usuario desde cookies del servidor
    const cookieStore = cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    if (!user || !user.idEmpresa_Gerencia) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const idVariableEmpresaGerencia = Number(searchParams.get('idVariableEmpresaGerencia'))
    const fechaInicio = searchParams.get('fechaInicio') // 'YYYY-MM-DD'
    const fechaFin = searchParams.get('fechaFin')       // 'YYYY-MM-DD'

    if (!idVariableEmpresaGerencia || !fechaInicio || !fechaFin) {
      return NextResponse.json({ 
        success: false, 
        message: 'Parámetros requeridos: idVariableEmpresaGerencia, fechaInicio, fechaFin' 
      }, { status: 400 })
    }

    const empresaGerencia = user.idEmpresa_Gerencia

    const query = `
      DECLARE 
          @empresaGerencia           INT  = @empresaGerenciaParam,
          @idVariableEmpresaGerencia INT  = @idVariableEmpresaGerenciaParam,
          @fechaInicio               DATE = @fechaInicioParam,
          @fechaFin                  DATE = @fechaFinParam;

      SELECT
          vegh.id_Variable_EmpresaGerencia_Hechos,
          vegh.id_Variable_Empresa_Gerencia,
          eg.id_Empresa_Gerencia,
          v.id_Variable,
          v.nombreVariable,
          vegh.periodo,
          vegh.valor,
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
        AND vegh.id_Variable_Empresa_Gerencia = @idVariableEmpresaGerencia
        AND vegh.periodo >= @fechaInicio
        AND vegh.periodo <  DATEADD(DAY, 1, @fechaFin)
      ORDER BY vegh.periodo DESC;
    `

    const params = {
      empresaGerenciaParam: empresaGerencia,
      idVariableEmpresaGerenciaParam: idVariableEmpresaGerencia,
      fechaInicioParam: fechaInicio,
      fechaFinParam: fechaFin,
    }

    const data = await executeQuery(query, params)
    const periodos = Array.from(new Set(data.map((r: any) => r.periodo))).sort()

    return NextResponse.json({ success: true, data, periodos })
  } catch (error: any) {
    console.error('❌ Error obteniendo histórico:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo histórico', 
      error: String(error) 
    }, { status: 500 })
  }
}

