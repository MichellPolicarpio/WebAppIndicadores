// API: Obtener histórico completo de una variable

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

// Obtiene todos los registros históricos de una variable
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const idVariableEmpresaGerencia = parseInt(params.id)

    if (!user.idEmpresa_Gerencia) {
      return NextResponse.json({ success: false, message: 'Usuario sin empresa asignada' }, { status: 400 })
    }

    const query = `
      SELECT
          vegh.id_Variable_EmpresaGerencia_Hechos,
          vegh.id_Variable_Empresa_Gerencia,
          eg.id_Empresa_Gerencia,
          v.id_Variable,
          v.nombreVariable,
          vegh.periodo,
          vegh.valor,
          vegh.fecha_Creacion,
          vegh.creado_Por,
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
        AND vegh.id_Variable_Empresa_Gerencia = @idVariableEmpresaGerencia
      ORDER BY vegh.periodo DESC;
    `

    const data = await executeQuery(query, { 
      empresaGerencia: user.idEmpresa_Gerencia,
      idVariableEmpresaGerencia 
    })

    return NextResponse.json({ success: true, data })
  } catch (error: any) {
    console.error('❌ Error obteniendo histórico:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo histórico', 
      error: String(error) 
    }, { status: 500 })
  }
}

