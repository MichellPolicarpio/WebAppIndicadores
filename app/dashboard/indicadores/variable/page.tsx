"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, History, Plus, X, ChevronLeft, ChevronRight, Calendar, Eye, ChevronDown } from "lucide-react"
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
import { Label } from "@/components/ui/label"
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

export default function VariablesPage() {
  const router = useRouter()
  const [variables, setVariables] = useState<VariableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estado para selector de mes
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date())
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [availableYears, setAvailableYears] = useState<number[]>([])
  
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
  

  useEffect(() => {
    fetchVariables()
  }, [selectedMonth])

  const fetchVariables = async () => {
    try {
      setIsLoading(true)
      setError("")
      
      // Formatear el mes seleccionado para la API
      const year = selectedMonth.getFullYear()
      const month = selectedMonth.getMonth() + 1
      const monthStr = `${year}-${month.toString().padStart(2, '0')}-01`
      
      const res = await fetch(`/api/variables?month=${monthStr}`, { cache: 'no-store' })
      const json = await res.json()
      console.log('Respuesta del API:', json)
      if (!json.success) {
        throw new Error(json.error || json.message || 'Error desconocido')
      }
      setVariables(json.data || [])
      setAvailableMonths(json.periodos || [])
      
      // Extraer años únicos de los períodos disponibles
      const years = [...new Set((json.periodos || []).map((period: string) => new Date(period).getFullYear()))]
        .sort((a, b) => b - a) // Ordenar de más reciente a más antiguo
      setAvailableYears(years)
    } catch (e: any) {
      console.error('Error en fetchVariables:', e)
      setError(e.message || 'Error cargando indicadores mensuales')
    } finally {
      setIsLoading(false)
    }
  }

  const formatPeriodo = (periodo: string) => {
    const d = new Date(periodo)
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${meses[d.getMonth()]} ${d.getFullYear()}`
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

    const valorNumerico = parseFloat(newMonthValue)
    if (isNaN(valorNumerico)) {
      toast.error('Por favor ingresa un valor numérico válido')
      return
    }

    setIsAdding(true)

    try {
      // Calcular el próximo mes
      const nextMonth = new Date(selectedMonth)
      nextMonth.setMonth(nextMonth.getMonth() + 1)
      const nextMonthString = nextMonth.toISOString().split('T')[0] + 'T00:00:00.000Z'

      const res = await fetch('/api/variables', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_Variable_Empresa_Gerencia: variableToAdd.id,
          periodo: nextMonthString,
          valor: valorNumerico,
          creado_Por: 'Usuario',
          observaciones_Periodo: newMonthObservations || `Variable agregada para el próximo mes: ${getMonthName(nextMonth)} ${nextMonth.getFullYear()}`
        })
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al agregar variable')
      }

      toast.success(`Variable "${variableToAdd.name}" agregada para ${getMonthName(nextMonth)} ${nextMonth.getFullYear()}`)
      
      // Recargar las variables del mes actual
      await fetchVariables()
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

    const valorNumerico = parseFloat(newValue)
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

  return (
    <div className="space-y-2 sm:space-y-3 w-full mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
      {/* Header Section */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/indicadores")}
          className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900 flex-shrink-0 mt-1"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Valores Guardados</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Selecciona un mes para ver los indicadores mensuales</p>
        </div>
      </div>


      {/* Selector de Mes */}
      <Card className="border-gray-200 bg-white shadow-md">
        <CardContent className="p-2 sm:p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                Seleccionar Período
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-gray-700">Año:</label>
              <Select 
                value={selectedMonth.getFullYear().toString()} 
                onValueChange={(value) => selectYear(parseInt(value))}
              >
                <SelectTrigger className="w-24 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500">
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
              className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-8 w-8 p-0 rounded-lg shadow-sm transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
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
                      className={`px-2 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                          : hasData
                          ? 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                      disabled={!hasData}
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
              className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-8 w-8 p-0 rounded-lg shadow-sm transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Información del período seleccionado */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-1.5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 px-3 py-1 rounded-lg shadow-sm">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                <div className="text-center sm:text-left">
                  <div className="text-xs text-blue-600 font-semibold">
                    Visualizando: <span className="font-bold text-blue-800">{getMonthYear(selectedMonth)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Error:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {isLoading ? (
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
              <div>
                <CardTitle className="text-xl sm:text-2xl text-gray-900">
                  Indicadores Mensuales del Período
                </CardTitle>
                <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                  {variables.length} indicador{variables.length !== 1 ? 'es' : ''} • {getMonthYear(selectedMonth)}
                </CardDescription>
              </div>
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
                {variables.length} Registro{variables.length !== 1 ? 's' : ''}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="text-left px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                      Variable
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                      Valor
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                      Período
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                      Observaciones
                    </th>
                    <th className="text-center px-3 py-3 text-xs font-bold text-gray-700 uppercase tracking-wider border border-gray-300">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {variables.map((row, index) => (
                    <tr 
                      key={row.id_Variable_EmpresaGerencia_Hechos} 
                      className={`hover:bg-blue-50 transition-all duration-150 ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-3 py-3 text-left border border-gray-300">
                        <div className="text-xs text-gray-900">
                          {row.nombreVariable}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center border border-gray-300">
                        <div className="text-xs text-blue-600">
                          {row.valor.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center border border-gray-300">
                        <div className="text-xs text-gray-700">
                          {formatPeriodo(row.periodo)}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-center border border-gray-300">
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
                      <td className="px-3 py-3 text-center border border-gray-300">
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
                            onClick={() => handleAddNextMonth(row.id_Variable_Empresa_Gerencia, row.nombreVariable)}
                            variant="outline"
                            className="h-10 w-10 p-0 rounded-xl border-2 border-green-500 text-green-500 hover:bg-green-50 hover:border-green-600 hover:text-green-600 transition-all duration-200"
                            title="Agregar variable del próximo mes"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
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
        <DialogContent className="sm:max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Histórico de Variable</DialogTitle>
            <DialogDescription>
              {currentVariableName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[500px]">
            {loadingHistory ? (
              <div className="text-center py-12 text-gray-500">Cargando histórico...</div>
            ) : historico.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No hay registros históricos</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Periodo</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Valor</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Creado</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {historico.map((row) => (
                    <tr key={row.id_Variable_EmpresaGerencia_Hechos} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {formatPeriodo(row.periodo)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-bold">
                        {row.valor.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        <div>{formatFecha(row.fecha_Creacion)}</div>
                        {row.creado_Por && (
                          <div className="text-xs text-gray-400">{row.creado_Por}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {row.observaciones_Periodo ? (
                          <div className="max-w-xs">
                            {row.observaciones_Periodo}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Sin observaciones</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setHistoryDialogOpen(false)}
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
