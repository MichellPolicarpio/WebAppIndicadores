// API: Obtener variables del último periodo

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  try {
    // Validar autenticación desde cookies
    const cookieStore = cookies()
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
    console.log('🔍 Buscando variables para empresa-gerencia:', empresaGerencia)

    // Query: obtiene MAX periodo y luego todas las variables de ese periodo
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
        AND vegh.periodo = @fechaPeriodo
      ORDER BY v.nombreVariable;
    `

    const params = { empresaGerenciaParam: empresaGerencia }
    const data = await executeQuery(query, params)

    console.log('✅ Variables obtenidas:', data.length)

    const periodos = Array.from(new Set(data.map((r: any) => r.periodo))).sort()

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


