"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import * as XLSX from 'xlsx'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Pencil, History, Plus, X, ChevronLeft, ChevronRight, Calendar, Eye, ChevronDown, Trash2, Building2, FileSpreadsheet, User, BarChart3 } from "lucide-react"
import { getUser, type User } from "@/lib/auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface VariableRow {
  id_Variable_EmpresaGerencia_Hechos: number
  id_Variable_Empresa_Gerencia: number
  id_Empresa_Gerencia: number
  id_Variable: number
  nombreVariable: string
  periodo: string
  valor: number
  nombreEmpresaOperadora: string
  nomGerencia?: string
  claveEmpresaOperadora?: string
  observaciones_Periodo?: string | null
}

interface HistoricoRow {
  id_Variable_EmpresaGerencia_Hechos: number
  id_Variable_Empresa_Gerencia: number
  nombreVariable: string
  periodo: string
  valor: number
  fecha_Creacion: string
  creado_Por: string | null
  observaciones_Periodo: string | null
}

interface Empresa {
  idEmpresaOperadora: number
  claveEmpresaOperadora: string
  nombreEmpresaOperadora: string
}

interface Gerencia {
  id_Empresa_Gerencia: number
  clave_Empresa_Gerencia: string
  nomGerencia: string
  nombreEmpresaOperadora: string
  claveEmpresaOperadora: string
}

export default function VariablesPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [variables, setVariables] = useState<VariableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estado para selector de mes
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  
  // Estado para filtros de admin (empresa y gerencia)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [gerencias, setGerencias] = useState<Gerencia[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("")
  const [selectedGerencia, setSelectedGerencia] = useState<string>("")
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [loadingGerencias, setLoadingGerencias] = useState(false)
  
  // Estado para agregar variable del próximo mes
  const [addNextMonthDialogOpen, setAddNextMonthDialogOpen] = useState(false)
  const [variableToAdd, setVariableToAdd] = useState<{id: number, name: string} | null>(null)
  const [newMonthValue, setNewMonthValue] = useState("")
  const [newMonthObservations, setNewMonthObservations] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  
  // Estado para modal de edición
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<VariableRow | null>(null)
  const [newValue, setNewValue] = useState("")
  const [newObservations, setNewObservations] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para modal de histórico
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historico, setHistorico] = useState<HistoricoRow[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [currentVariableName, setCurrentVariableName] = useState("")
  
  // Estado para el siguiente mes (para evitar duplicados al agregar)
  const [nextMonthVariables, setNextMonthVariables] = useState<VariableRow[]>([])

  // Detectar si es admin al cargar
  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setUser(currentUser)
      const userIsAdmin = currentUser.rolUsuario === 1
      setIsAdmin(userIsAdmin)
      
      // Solo cargar empresas si es admin y hay usuario válido
      if (userIsAdmin && currentUser.id) {
        console.log('🔍 [Frontend] Usuario admin detectado, cargando empresas...', { id: currentUser.id, rolUsuario: currentUser.rolUsuario })
        fetchEmpresas()
      }
    } else {
      console.warn('⚠️ [Frontend] No se encontró usuario en localStorage')
    }
  }, [])

  // Precompute a lookup para el próximo mes: ids de id_Variable_Empresa_Gerencia existentes
  const nextMonthIdSet = useMemo(() => {
    const set = new Set<number>()
    nextMonthVariables.forEach(v => set.add(v.id_Variable_Empresa_Gerencia))
    return set
  }, [nextMonthVariables])

  // Cargar empresas (solo admin)
  const fetchEmpresas = async () => {
    // Verificar que el usuario esté disponible antes de hacer la llamada
    const currentUser = getUser()
    if (!currentUser || currentUser.rolUsuario !== 1) {
      console.warn('⚠️ [Frontend] No se puede cargar empresas: usuario no es admin')
      return
    }
    
    setLoadingEmpresas(true)
    try {
      console.log('📡 [Frontend] Llamando API /api/admin/empresas...')
      const response = await fetch('/api/admin/empresas', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      console.log('📥 [Frontend] Respuesta recibida:', { status: response.status, ok: response.ok })
      
      const result = await response.json()
      console.log('📥 [Frontend] Resultado parseado:', result)
      
      if (!response.ok || !result.success) {
        console.error('❌ [Frontend] Error cargando empresas:', result.message)
        toast.error(result.message || 'Error al cargar empresas')
        return
      }
      
      if (result.empresas) {
        console.log('✅ [Frontend] Empresas cargadas:', result.empresas.length)
        setEmpresas(result.empresas)
      }
    } catch (error: any) {
      console.error('❌ [Frontend] Error en fetch de empresas:', error)
      toast.error('Error al cargar empresas: ' + (error.message || 'Error desconocido'))
    } finally {
      setLoadingEmpresas(false)
    }
  }

  // Cargar gerencias según empresa seleccionada (solo admin)
  const fetchGerencias = async (empresaId: string) => {
    if (!empresaId) {
      setGerencias([])
      setSelectedGerencia("")
      return
    }
    
    setLoadingGerencias(true)
    try {
      const response = await fetch(`/api/admin/gerencias?empresaId=${empresaId}`, {
        credentials: 'include'
      })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        console.error('Error cargando gerencias:', result.message)
        toast.error(result.message || 'Error al cargar gerencias')
        return
      }
      
      if (result.gerencias) {
        setGerencias(result.gerencias)
        // Si había una gerencia seleccionada pero no está en la nueva lista, limpiarla
        if (selectedGerencia) {
          const gerenciaExiste = result.gerencias.some((g: Gerencia) => 
            g.id_Empresa_Gerencia.toString() === selectedGerencia
          )
          if (!gerenciaExiste) {
            setSelectedGerencia("")
          }
        }
      }
    } catch (error: any) {
      console.error('Error cargando gerencias:', error)
      toast.error('Error al cargar gerencias')
    } finally {
      setLoadingGerencias(false)
    }
  }

  // Efecto cuando cambia la empresa seleccionada
  useEffect(() => {
    if (isAdmin && selectedEmpresa) {
      fetchGerencias(selectedEmpresa)
    } else if (isAdmin && !selectedEmpresa) {
      setGerencias([])
      setSelectedGerencia("")
    }
  }, [selectedEmpresa, isAdmin])

  // Efecto cuando cambian los filtros o el mes
  useEffect(() => {
    // No ejecutar si aún no sabemos si es admin (user no está cargado)
    if (!user) {
      return
    }
    
    // No ejecutar fetchVariables si es admin y no tiene gerencia seleccionada
    if (isAdmin && !selectedGerencia) {
      // Admin sin gerencia: limpiar variables y no hacer fetch
      setVariables([])
      setAvailableMonths([])
      setError("")
      return
    }
    
    // Solo hacer fetch si es usuario normal o admin con gerencia seleccionada
    fetchVariables()
    fetchNextMonthVariables()
  }, [selectedMonth, selectedGerencia, isAdmin, user])

  const fetchVariables = async (dateOverride?: Date) => {
    // Validación temprana: no hacer nada si el usuario no está cargado
    if (!user) {
      console.log('⏭️ [Frontend] Usuario no cargado aún, saltando fetchVariables')
      return
    }
    
    // Validación temprana: si es admin sin gerencia, no hacer nada
    if (isAdmin && !selectedGerencia) {
      console.log('⏭️ [Frontend] Admin sin gerencia seleccionada, saltando fetchVariables')
      setVariables([])
      setAvailableMonths([])
      setError("")
      setIsLoading(false)
      return
    }
    
    try {
      setIsLoading(true)
      setError("")
      
      // Formatear el mes (con override si viene)
      const baseDate = dateOverride ?? selectedMonth
      const year = baseDate.getFullYear()
      const month = baseDate.getMonth() + 1
      const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`
      
      let res: Response
      
      console.log('📡 [Frontend] fetchVariables:', { isAdmin, selectedGerencia, year, month })
      
      // Si es admin y tiene gerencia seleccionada, usar API de admin
      if (isAdmin && selectedGerencia) {
        res = await fetch(`/api/admin/variables?empresaGerencia=${selectedGerencia}&year=${year}&month=${month}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
      } else if (!isAdmin) {
        // Usuario normal: usar API normal
        res = await fetch(`/api/variables?month=${monthStr}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
      } else {
        // Admin sin gerencia seleccionada: no cargar datos
        setVariables([])
        setAvailableMonths([])
        setIsLoading(false)
        return
      }
      
      const json = await res.json()
      console.log('Respuesta del API:', json)
      
      if (!res.ok) {
        console.error('❌ Error en respuesta del servidor:', json)
        setError(json.message || json.error || 'Error desconocido')
        toast.error(json.message || 'Error al cargar indicadores')
        setVariables([])
        setAvailableMonths([])
        return
      }
      
      if (!json.success) {
        setError(json.error || json.message || 'Error desconocido')
        toast.error(json.message || 'Error al cargar indicadores')
        setVariables([])
        setAvailableMonths([])
        return
      }
      setVariables(json.data || [])
      setAvailableMonths(json.periodos || [])
      
      // Extraer años únicos de los períodos disponibles (usar UTC para evitar desfase)
      const years = [...new Set((json.periodos || []).map((period: string) => new Date(period).getUTCFullYear()))]
        .sort((a, b) => b - a)
      setAvailableYears(years)
    } catch (e: any) {
      console.error('Error en fetchVariables:', e)
      setError(e.message || 'Error cargando indicadores mensuales')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchNextMonthVariables = async () => {
    // Validación temprana: no hacer nada si el usuario no está cargado
    if (!user) {
      return
    }
    
    // Validación temprana: si es admin sin gerencia, no hacer nada
    if (isAdmin && !selectedGerencia) {
      setNextMonthVariables([])
      return
    }
    
    try {
      // Calcular el próximo mes basado en selectedMonth
      const nextMonthDate = new Date(selectedMonth)
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)
      const year = nextMonthDate.getFullYear()
      const month = nextMonthDate.getMonth() + 1
      const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`
      
      let res: Response
      
      // Si es admin y tiene gerencia seleccionada, usar API de admin
      if (isAdmin && selectedGerencia) {
        res = await fetch(`/api/admin/variables?empresaGerencia=${selectedGerencia}&year=${year}&month=${month}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
      } else if (!isAdmin) {
        // Usuario normal: usar API normal
        res = await fetch(`/api/variables?month=${monthStr}`, { 
          cache: 'no-store',
          credentials: 'include'
        })
      } else {
        // Admin sin gerencia seleccionada: no cargar datos del próximo mes
        setNextMonthVariables([])
        return
      }
      
      const json = await res.json()
      if (!json.success) {
        setNextMonthVariables([])
        return
      }
      setNextMonthVariables(json.data || [])
    } catch (e) {
      setNextMonthVariables([])
    }
  }

  const formatPeriodo = (periodo: string) => {
    const d = new Date(periodo)
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${meses[d.getUTCMonth()]} ${d.getUTCFullYear()}`
  }

  const formatFecha = (fecha: string) => {
    if (!fecha) return '-'
    const d = new Date(fecha)
    return d.toLocaleDateString('es-MX', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Funciones para el selector de mes
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedMonth)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setSelectedMonth(newDate)
  }

  const selectMonth = (monthIndex: number) => {
    const newDate = new Date(selectedMonth)
    newDate.setMonth(monthIndex)
    setSelectedMonth(newDate)
  }

  const selectYear = (year: number) => {
    const newDate = new Date(selectedMonth)
    newDate.setFullYear(year)
    setSelectedMonth(newDate)
  }

  const getMonthName = (date: Date) => {
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return meses[date.getMonth()]
  }

  const getMonthYear = (date: Date) => {
    return `${getMonthName(date)} ${date.getFullYear()}`
  }

  // ==================== AGREGAR VARIABLE DEL PRÓXIMO MES ====================
  const handleAddNextMonth = (idVariableEmpresaGerencia: number, nombreVariable: string) => {
    setVariableToAdd({ id: idVariableEmpresaGerencia, name: nombreVariable })
    setAddNextMonthDialogOpen(true)
    setNewMonthValue("")
    setNewMonthObservations("")
  }

  const handleConfirmAddNextMonth = async () => {
    if (!variableToAdd || !newMonthValue) return

    // Limpiar el valor antes de convertir: quitar comas
    const valorNumerico = parseFloat(newMonthValue.replace(/,/g, ''))
    if (isNaN(valorNumerico)) {
      toast.error('Por favor ingresa un valor numérico válido')
      return
    }

    setIsAdding(true)

    try {
      // Calcular el próximo mes
      const nextMonth = new Date(selectedMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      // Forzar día 01 del próximo mes en UTC
      const year = nextMonth.getFullYear()
      const month = String(nextMonth.getMonth() + 1).padStart(2, '0')
      const nextMonthString = `${year}-${month}-01T00:00:00.000Z`

      const res = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          id_Variable_Empresa_Gerencia: variableToAdd.id,
          periodo: nextMonthString,
          valor: valorNumerico,
          observaciones_Periodo: newMonthObservations || null
        })
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al agregar variable')
      }

      toast.success(`Variable "${variableToAdd.name}" agregada para ${getMonthName(nextMonth)} ${nextMonth.getFullYear()}`)
      
      // Mover la vista al próximo mes para ver inmediatamente el nuevo registro
      setSelectedMonth(new Date(nextMonth))
      // Recargar las variables del nuevo mes seleccionado (evitar desfase de estado)
      await fetchVariables(nextMonth)
      // Y también recargar las del siguiente mes del nuevo contexto
      await fetchNextMonthVariables()
    } catch (e: any) {
      toast.error(e.message || 'Error al agregar la variable')
    } finally {
      setIsAdding(false)
      setAddNextMonthDialogOpen(false)
      setVariableToAdd(null)
      setNewMonthValue("")
      setNewMonthObservations("")
    }
  }

  // ==================== EDITAR ====================
  const handleEdit = (row: VariableRow) => {
    setItemToEdit(row)
    setNewValue(row.valor.toString())
    setNewObservations(row.observaciones_Periodo || "") // Cargar observaciones existentes
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!itemToEdit) return
    // Limpiar valor antes de convertir
    const valorNumerico = parseFloat(newValue.replace(/,/g, ''))
    if (isNaN(valorNumerico)) {
      toast.error('El valor debe ser un número válido')
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch(`/api/variables/${itemToEdit.id_Variable_EmpresaGerencia_Hechos}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          valor: valorNumerico,
          observaciones_Periodo: newObservations || null
        }),
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al actualizar')
      }

      toast.success('Variable actualizada exitosamente')
      
      // Actualizar la tabla local
      setVariables(variables.map(v => 
        v.id_Variable_EmpresaGerencia_Hechos === itemToEdit.id_Variable_EmpresaGerencia_Hechos
          ? { ...v, valor: valorNumerico, observaciones_Periodo: newObservations || null }
          : v
      ))

      setEditDialogOpen(false)
      setItemToEdit(null)
      setNewValue("")
      setNewObservations("")
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar el indicador')
    } finally {
      setIsSaving(false)
    }
  }

  // ==================== ELIMINAR ====================
  const handleDeleteRow = async (row: VariableRow) => {
    const ok = window.confirm(`¿Eliminar "${row.nombreVariable}" del período ${formatPeriodo(row.periodo)}?`)
    if (!ok) return
    try {
      const res = await fetch(`/api/variables/${row.id_Variable_EmpresaGerencia_Hechos}`, { method: 'DELETE' })
      const json = await res.json()
      if (!json.success) {
        throw new Error(json.message || 'Error al eliminar')
      }
      // Quitar de la tabla local
      setVariables(prev => prev.filter(v => v.id_Variable_EmpresaGerencia_Hechos !== row.id_Variable_EmpresaGerencia_Hechos))
      toast.success('Registro eliminado')
      // Recargar conjuntos auxiliares
      await fetchNextMonthVariables()
    } catch (e: any) {
      toast.error(e.message || 'No se pudo eliminar el registro')
    }
  }

  // ==================== HISTÓRICO ====================
  const handleViewHistory = async (idVariableEmpresaGerencia: number, nombreVariable: string) => {
    setCurrentVariableName(nombreVariable)
    setHistoryDialogOpen(true)
    setLoadingHistory(true)

    try {
      const res = await fetch(`/api/variables/historico/${idVariableEmpresaGerencia}`, {
        cache: 'no-store'
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al cargar histórico')
      }

      setHistorico(json.data || [])
    } catch (e: any) {
      toast.error(e.message || 'Error al cargar el histórico')
      setHistorico([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // ==================== EXPORTAR A EXCEL ====================
  const handleExportToExcel = () => {
    try {
      // Preparar los datos para Excel
      const excelData = variables.map((variable, index) => ({
        '#': index + 1,
        'Indicador': variable.nombreVariable,
        'Valor': variable.valor !== null && variable.valor !== undefined ? variable.valor : '-',
        'Observaciones': variable.observaciones_Periodo || '-',
        ...(isAdmin && selectedGerencia ? {
          'Empresa': variable.nombreEmpresaOperadora || '-',
          'Gerencia': variable.nomGerencia || '-'
        } : {})
      }))

      // Crear workbook y worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Indicadores')

      // Ajustar ancho de columnas
      const colWidths = [
        { wch: 5 },  // #
        { wch: 35 }, // Indicador
        { wch: 12 }, // Valor
        { wch: 40 }, // Observaciones
        ...(isAdmin && selectedGerencia ? [
          { wch: 25 }, // Empresa
          { wch: 25 }  // Gerencia
        ] : [])
      ]
      ws['!cols'] = colWidths

      // Generar nombre del archivo
      const monthYear = getMonthYear(selectedMonth)
      const fileName = `Indicadores_Mensuales_${monthYear.replace(/\s+/g, '_')}.xlsx`

      // Descargar el archivo
      XLSX.writeFile(wb, fileName)
      toast.success('Archivo Excel generado exitosamente')
    } catch (error: any) {
      console.error('Error al exportar a Excel:', error)
      toast.error('Error al generar el archivo Excel')
    }
  }

  return (
    <div className="space-y-2 sm:space-y-3 w-full mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Valores Guardados</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Selecciona un mes para ver los indicadores mensuales</p>
        </div>
      </div>


      {/* Selector de Mes */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-blue-600" />
            <span className="text-xs font-medium text-gray-700">Período:</span>
          </div>
          <div className="flex items-center gap-1.5">
            <label className="text-xs text-gray-600">Año</label>
            <Select 
              value={selectedMonth.getFullYear().toString()} 
              onValueChange={(value) => selectYear(parseInt(value))}
            >
              <SelectTrigger className="w-20 h-7 text-xs px-2 rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()} className="text-xs">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Navegación de meses */}
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('prev')}
            className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-7 w-7 p-0 rounded-md shadow-sm transition-all"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          
          {/* Container de meses con grid responsive */}
          <div className="flex-1">
            <div className="grid grid-cols-6 xl:grid-cols-12 gap-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-1.5 shadow-inner">
              {Array.from({ length: 12 }, (_, i) => {
                const monthDate = new Date(selectedMonth.getFullYear(), i, 1)
                const isSelected = selectedMonth.getMonth() === i
                const hasData = availableMonths.some(period => {
                  const periodDate = new Date(period)
                  return periodDate.getMonth() === i && periodDate.getFullYear() === selectedMonth.getFullYear()
                })
                
                return (
                  <button
                    key={i}
                    onClick={() => selectMonth(i)}
                    className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : hasData
                        ? 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                        : 'bg-gray-200 text-gray-400 hover:bg-gray-300 hover:text-gray-500'
                    }`}
                  >
                    {getMonthName(monthDate)}
                  </button>
                )
              })}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateMonth('next')}
            className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-7 w-7 p-0 rounded-md shadow-sm transition-all"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
        
        {/* Filtros de Admin (solo si es admin) */}
        {isAdmin && (
          <div className="pt-2.5 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5">
              {/* Icono y título compacto */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Building2 className="h-3.5 w-3.5 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Filtros:</span>
              </div>
              
              {/* Filtros en línea horizontal */}
              <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Label htmlFor="empresa-filter" className="text-xs text-gray-600 whitespace-nowrap">Empresa</Label>
                  <Select
                    value={selectedEmpresa}
                    onValueChange={(value) => {
                      setSelectedEmpresa(value)
                      setSelectedGerencia("")
                    }}
                    disabled={loadingEmpresas}
                  >
                    <SelectTrigger id="empresa-filter" className="h-7 text-xs px-2 rounded-md">
                      <SelectValue placeholder={loadingEmpresas ? "..." : "Seleccionar"} />
                    </SelectTrigger>
                    <SelectContent>
                      {empresas.map((empresa) => (
                        <SelectItem key={empresa.idEmpresaOperadora} value={empresa.idEmpresaOperadora.toString()}>
                          {empresa.nombreEmpresaOperadora} ({empresa.claveEmpresaOperadora})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <Label htmlFor="gerencia-filter" className="text-xs text-gray-600 whitespace-nowrap">Gerencia</Label>
                  <Select
                    value={selectedGerencia}
                    onValueChange={setSelectedGerencia}
                    disabled={!selectedEmpresa || loadingGerencias}
                  >
                    <SelectTrigger id="gerencia-filter" className="h-7 text-xs px-2 rounded-md">
                      <SelectValue 
                        placeholder={
                          !selectedEmpresa 
                            ? "Selecciona empresa" 
                            : loadingGerencias 
                            ? "..." 
                            : "Seleccionar"
                        } 
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {gerencias.map((gerencia) => (
                        <SelectItem key={gerencia.id_Empresa_Gerencia} value={gerencia.id_Empresa_Gerencia.toString()}>
                          {gerencia.nomGerencia}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Indicador de visualización compacto */}
              {selectedEmpresa && selectedGerencia && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-200 rounded-md text-xs text-gray-600 flex-shrink-0 max-w-[180px] truncate shadow-sm">
                  {gerencias.find(g => g.id_Empresa_Gerencia.toString() === selectedGerencia)?.nomGerencia} - {empresas.find(e => e.idEmpresaOperadora.toString() === selectedEmpresa)?.claveEmpresaOperadora}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Información del período seleccionado */}
        <div className={`${isAdmin ? 'mt-2.5' : 'mt-2'} pt-2 border-t border-gray-200`}>
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-md text-xs text-blue-700 shadow-sm">
              <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-semibold">{getMonthYear(selectedMonth)}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}


      {isAdmin && !selectedGerencia ? (
        <Card className="border-gray-200 bg-white shadow-md">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
              <Building2 className="h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">Seleccione filtros para mostrar datos</p>
              <p className="text-sm">Selecciona empresa y gerencia en los filtros de arriba</p>
            </div>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <Card className="border-gray-200 bg-white shadow-md">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg text-gray-600">Cargando indicadores mensuales...</p>
            </div>
          </CardContent>
        </Card>
      ) : variables.length === 0 ? (
        <Card className="border-gray-200 bg-white shadow-md">
          <CardContent className="py-20">
            <div className="flex flex-col items-center justify-center gap-4 text-gray-500">
              <Calendar className="h-16 w-16 opacity-50" />
              <p className="text-lg font-medium">No hay indicadores mensuales para este mes</p>
              <p className="text-sm">Selecciona otro mes para ver los indicadores disponibles</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-gray-200 bg-white shadow-md">
          <CardHeader className="border-b border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex-1">
                <CardTitle className="text-xl sm:text-2xl text-gray-900">
                  Indicadores Mensuales del Período
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                  {variables.length}/18 indicador{variables.length !== 1 ? 'es' : ''} • {getMonthYear(selectedMonth)}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportToExcel}
                  className="h-8 px-4 text-xs border-green-600 text-green-700 hover:bg-green-50 hover:border-green-700 bg-white flex items-center gap-2"
                >
                  <svg 
                    className="h-4 w-4" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" fill="#217346" />
                    <path d="M8 7V17M12 7V17M16 7V17" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M8 7H16M8 11H16M8 15H16" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Exportar Excel
                </Button>
                <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                  {variables.length} Registro{variables.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-center px-3 xl:px-6 py-6 text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[250px] xl:min-w-[350px]">
                      Variable
                    </th>
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 min-w-[120px] xl:min-w-[150px]">
                      Valor
                    </th>
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 min-w-[200px] xl:min-w-[250px]">
                      Observaciones
                    </th>
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10 min-w-[120px] xl:min-w-[180px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variables.map((row) => (
                    <tr key={row.id_Variable_EmpresaGerencia_Hechos} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 xl:px-6 py-6 text-center text-xs text-gray-900 sticky left-0 bg-white z-10 font-medium max-w-[250px] xl:max-w-[350px] leading-relaxed" title={row.nombreVariable}>
                        <div className="whitespace-normal break-words hyphens-auto" style={{ wordBreak: 'break-word', lineHeight: '1.4' }}>
                          {row.nombreVariable}
                        </div>
                      </td>
                      <td className="px-3 xl:px-6 py-3 text-center text-xs">
                        <span className="text-blue-600 font-medium">
                          {row.valor.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-3 xl:px-6 py-3 text-center text-xs">
                        {row.observaciones_Periodo && row.observaciones_Periodo.length > 30 ? (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="text-xs text-gray-600 hover:text-blue-600 flex items-center justify-center gap-1 mx-auto transition-colors">
                                <span className="max-w-[150px] truncate">
                                  {row.observaciones_Periodo.substring(0, 30)}...
                                </span>
                                <Eye className="h-3 w-3 flex-shrink-0" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 max-w-sm">
                              <div className="space-y-2">
                                <h4 className="font-semibold text-sm text-gray-900">Observaciones</h4>
                                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                                  {row.observaciones_Periodo}
                                </p>
                              </div>
                            </PopoverContent>
                          </Popover>
                        ) : (
                          <div className="text-xs text-gray-600">
                            {row.observaciones_Periodo || '-'}
                          </div>
                        )}
                      </td>
                      <td className="px-3 xl:px-6 py-3 text-center sticky right-0 bg-white z-10">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(row)}
                            variant="outline"
                            className="h-10 w-10 p-0 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 transition-all duration-200"
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewHistory(row.id_Variable_Empresa_Gerencia, row.nombreVariable)}
                            variant="outline"
                            className="h-10 w-10 p-0 rounded-xl border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                            title="Ver Histórico"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteRow(row)}
                            variant="outline"
                            className="h-10 w-10 p-0 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          {(() => {
                            const existeEnSiguienteMes = nextMonthIdSet.has(row.id_Variable_Empresa_Gerencia)
                            return (
                              <Button
                                size="sm"
                                onClick={() => handleAddNextMonth(row.id_Variable_Empresa_Gerencia, row.nombreVariable)}
                                variant="outline"
                                disabled={existeEnSiguienteMes}
                                className={`h-10 w-10 p-0 rounded-xl border-2 ${existeEnSiguienteMes ? 'border-gray-400 text-gray-400 cursor-not-allowed opacity-50' : 'border-green-500 text-green-500 hover:bg-green-50 hover:border-green-600 hover:text-green-600'} transition-all duration-200`}
                                title={existeEnSiguienteMes ? 'Ya existe esta variable en el próximo mes' : 'Agregar variable del próximo mes'}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            )
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ==================== DIÁLOGO AGREGAR VARIABLE DEL PRÓXIMO MES ==================== */}
      <Dialog open={addNextMonthDialogOpen} onOpenChange={setAddNextMonthDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Agregar Variable del Próximo Mes
            </DialogTitle>
            <DialogDescription>
              Agregar un nuevo valor para la variable <strong>"{variableToAdd?.name}"</strong> en el próximo mes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nextMonthValue">Valor para {getMonthName(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))} {new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1).getFullYear()}</Label>
              <Input
                id="nextMonthValue"
                type="number"
                step="0.01"
                placeholder="Ingresa el valor numérico"
                value={newMonthValue}
                onChange={(e) => setNewMonthValue(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextMonthObservations">Observaciones (Opcional)</Label>
              <textarea
                id="nextMonthObservations"
                value={newMonthObservations}
                onChange={(e) => setNewMonthObservations(e.target.value)}
                placeholder="Agregar observaciones sobre este valor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setAddNextMonthDialogOpen(false)}
              disabled={isAdding}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAddNextMonth}
              disabled={isAdding || !newMonthValue}
              className="bg-green-600 hover:bg-green-700"
            >
              {isAdding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Agregando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Variable
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL DE EDICIÓN ==================== */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Variable</DialogTitle>
            <DialogDescription>
              {itemToEdit?.nombreVariable}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="valor">Nuevo Valor</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Ingrese el nuevo valor"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
              <textarea
                id="observaciones"
                value={newObservations}
                onChange={(e) => setNewObservations(e.target.value)}
                placeholder="Agregar observaciones sobre este valor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
              />
            </div>
            <div className="text-sm text-gray-500">
              <p>Periodo: <span className="font-medium">{itemToEdit && formatPeriodo(itemToEdit.periodo)}</span></p>
              <p>Valor actual: <span className="font-medium">{itemToEdit?.valor.toLocaleString()}</span></p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ==================== MODAL DE HISTÓRICO ==================== */}
      <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
        <DialogContent className="sm:max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="p-2 bg-blue-100 rounded-lg">
                <History className="h-5 w-5 text-blue-600" />
              </div>
              <span>Histórico de Variable</span>
            </DialogTitle>
            <DialogDescription className="mt-2 text-base font-medium text-gray-700">
              {currentVariableName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-auto max-h-[calc(90vh-180px)] mt-4 rounded-lg border border-gray-200 bg-white">
            {loadingHistory ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-sm font-medium">Cargando histórico...</p>
              </div>
            ) : historico.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <History className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-sm font-medium">No hay registros históricos</p>
                <p className="text-xs text-gray-400 mt-1">Esta variable aún no tiene historial de cambios</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Período</span>
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-4 w-4" />
                          <span>Valor</span>
                        </div>
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Observaciones
                      </th>
                      <th className="text-left px-6 py-4 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>Auditoría</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {historico.map((row, index) => (
                      <tr 
                        key={row.id_Variable_EmpresaGerencia_Hechos} 
                        className={`hover:bg-blue-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {formatPeriodo(row.periodo)}
                            </span>
                            <span className="text-xs text-gray-500 mt-0.5">
                              {new Date(row.fecha_Creacion).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-base font-bold text-blue-700">
                            {row.valor.toLocaleString('es-MX', {
                              minimumFractionDigits: 0,
                              maximumFractionDigits: 2
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-md">
                          {row.observaciones_Periodo ? (
                            <div className="bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                              <p className="text-sm text-gray-700 leading-relaxed">
                                {row.observaciones_Periodo}
                              </p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic flex items-center gap-1">
                              <X className="h-3 w-3" />
                              Sin observaciones
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            {row.creado_Por && (
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  <User className="h-3 w-3 mr-1.5" />
                                  {row.creado_Por}
                                </span>
                              </div>
                            )}
                            <span className="text-xs text-gray-500">
                              Creado: {new Date(row.fecha_Creacion).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <DialogFooter className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between w-full">
              {historico.length > 0 && (
                <div className="text-xs text-gray-500 flex items-center gap-2">
                  <History className="h-3.5 w-3.5" />
                  <span>{historico.length} registro{historico.length !== 1 ? 's' : ''} histórico{historico.length !== 1 ? 's' : ''}</span>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => setHistoryDialogOpen(false)}
                className="ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
