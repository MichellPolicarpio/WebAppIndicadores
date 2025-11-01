// API: Obtener notificaciones de recordatorio de indicadores faltantes

import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/database'
import { cookies } from 'next/headers'

// Total de indicadores esperados por gerencia
const TOTAL_INDICADORES_ESPERADOS = 18

export async function GET(req: NextRequest) {
  try {
    // Verificar autenticación
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    
    if (!userCookie?.value) {
      return NextResponse.json({ success: false, message: 'Usuario no autenticado' }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    
    // Solo usuarios no-admin necesitan notificaciones (los admin no tienen gerencia asignada)
    if (user.rolUsuario === 1 || !user.idEmpresa_Gerencia) {
      return NextResponse.json({ 
        success: true, 
        notifications: [] 
      })
    }

    const empresaGerencia = user.idEmpresa_Gerencia
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1 // 1-12

    // Usar el total fijo de 18 indicadores esperados
    // (Aunque en la BD haya más variables activas, solo se esperan 18 completos)
    const totalVariablesEsperadas = TOTAL_INDICADORES_ESPERADOS

    // Generar lista de meses a verificar (mes actual y los 6 meses anteriores)
    const mesesAVerificar: Array<{ year: number, month: number, monthName: string }> = []
    
    for (let i = 0; i <= 6; i++) {
      const fecha = new Date(currentYear, currentMonth - 1 - i, 1)
      const year = fecha.getFullYear()
      const month = fecha.getMonth() + 1
      
      const monthNames = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
      ]
      const monthName = monthNames[month - 1]
      
      mesesAVerificar.push({ year, month, monthName })
    }

    const notifications: Array<{
      id: string
      type: 'missing_indicators'
      title: string
      message: string
      month: string
      year: number
      monthNumber: number
      faltantes: number
      total: number
    }> = []

    // Verificar cada mes
    for (const { year, month, monthName } of mesesAVerificar) {
      // Contar cuántas variables tiene registradas este mes
      const countQuery = `
        SELECT COUNT(DISTINCT v.id_Variable) as total_registrados
        FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
        INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
          ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
        INNER JOIN INDICADORES.VARIABLES AS v
          ON v.id_Variable = veg.id_Variable
        WHERE veg.id_Empresa_Gerencia = @empresaGerencia
          AND YEAR(vegh.periodo) = @year
          AND MONTH(vegh.periodo) = @month
      `
      
      const countData = await executeQuery(countQuery, { 
        empresaGerencia, 
        year, 
        month 
      })
      
      const totalRegistrados = countData[0]?.total_registrados || 0
      
      // Si faltan indicadores, crear notificación
      if (totalRegistrados < totalVariablesEsperadas) {
        const faltantes = totalVariablesEsperadas - totalRegistrados
        
        notifications.push({
          id: `missing-${year}-${month}`,
          type: 'missing_indicators',
          title: `Indicadores incompletos - ${monthName} ${year}`,
          message: `Faltan ${faltantes} de ${totalVariablesEsperadas} indicadores para el mes de ${monthName} ${year}. Por favor completa los indicadores faltantes.`,
          month: monthName,
          year,
          monthNumber: month,
          faltantes,
          total: totalVariablesEsperadas
        })
      }
    }

    // Ordenar notificaciones: mes actual primero, luego meses anteriores
    notifications.sort((a, b) => {
      if (a.year === currentYear && a.monthNumber === currentMonth) return -1
      if (b.year === currentYear && b.monthNumber === currentMonth) return 1
      if (a.year !== b.year) return b.year - a.year
      return b.monthNumber - a.monthNumber
    })

    return NextResponse.json({
      success: true,
      notifications,
      total: notifications.length
    })

  } catch (error: any) {
    console.error('❌ Error obteniendo notificaciones:', error)
    return NextResponse.json({
      success: false,
      message: 'Error obteniendo notificaciones',
      error: error.message || String(error),
      notifications: []
    }, { status: 500 })
  }
}

