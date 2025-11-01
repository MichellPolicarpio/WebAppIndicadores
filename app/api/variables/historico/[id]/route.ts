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
    const isAdmin = user.rolUsuario === 1

    console.log('🔍 [Histórico] Usuario:', { usuario: user.usuario, rolUsuario: user.rolUsuario, isAdmin })
    console.log('🔍 [Histórico] idVariableEmpresaGerencia:', idVariableEmpresaGerencia)

    // Solo validar idEmpresa_Gerencia si NO es admin
    if (!isAdmin && !user.idEmpresa_Gerencia) {
      return NextResponse.json({ success: false, message: 'Usuario sin empresa asignada' }, { status: 400 })
    }

    // Query diferente para admin vs usuario regular
    let query: string
    let queryParams: any

    if (isAdmin) {
      // Admin puede ver histórico de cualquier variable sin filtrar por empresa/gerencia
      query = `
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
            eo.nombreEmpresaOperadora,
            g.nomGerencia,
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
        LEFT JOIN dbo.GERENCIAS AS g
            ON g.idGerencia = eg.id_Gerencia
        WHERE vegh.id_Variable_Empresa_Gerencia = @idVariableEmpresaGerencia
        ORDER BY vegh.periodo DESC;
      `
      queryParams = { idVariableEmpresaGerencia }
    } else {
      // Usuario regular: filtrar por su empresa/gerencia
      query = `
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
      queryParams = { 
        empresaGerencia: user.idEmpresa_Gerencia,
        idVariableEmpresaGerencia 
      }
    }

    console.log('📊 [Histórico] Ejecutando query para admin:', isAdmin)
    console.log('📊 [Histórico] Parámetros:', queryParams)
    
    const data = await executeQuery(query, queryParams)
    
    console.log('✅ [Histórico] Datos obtenidos:', data?.length || 0, 'registros')

    return NextResponse.json({ success: true, data: data || [] })
  } catch (error: any) {
    console.error('❌ Error obteniendo histórico:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Error obteniendo histórico', 
      error: String(error) 
    }, { status: 500 })
  }
}

