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

    const empresaGerencia = user.idEmpresa_Gerencia

    const query = `
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
        AND vegh.periodo >= @fechaPeriodo
      ORDER BY vegh.periodo DESC, v.nombreVariable;
    `

    const params = { empresaGerenciaParam: empresaGerencia }
    const data = await executeQuery(query, params)

    const periodos = Array.from(new Set(data.map((r: any) => r.periodo))).sort()

    return NextResponse.json({ success: true, data, periodos })
  } catch (error: any) {
    console.error('❌ Error obteniendo variables:', error)
    return NextResponse.json({ success: false, message: 'Error obteniendo variables', error: String(error) }, { status: 500 })
  }
}


