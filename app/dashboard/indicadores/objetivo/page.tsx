"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Target, Pencil, Check, X, History, Trash2, AlertCircle, Calendar, BarChart3, Edit3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface Objetivo {
  id: string
  nombre: string
  valorObjetivo: string
  valoresMensuales: { [mes: string]: string }
  periodo: string
  progreso: number
}

export default function AgregarObjetivoPage() {
  const router = useRouter()

  const getCurrentDate = () => {
    const now = new Date()
    return {
      month: now.getMonth(), // 0-11
      year: now.getFullYear(),
    }
  }

  const getMonthName = (monthIndex: number) => {
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
    return months[monthIndex]
  }

  const generateAvailableMonths = () => {
    const current = getCurrentDate()
    const months = []

    // Generate months from January of current year to current month
    for (let i = 0; i <= current.month; i++) {
      months.push({
        value: getMonthName(i),
        index: i,
        year: current.year,
      })
    }

    return months
  }

  const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 2, currentYear - 1, currentYear]
  }

  const generateMonths = () => {
    return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  }

  const [currentDate] = useState(getCurrentDate())
  const [availableMonths] = useState(generateAvailableMonths())
  const [years] = useState(generateYears())

  const [objetivos, setObjetivos] = useState<Objetivo[]>([
    {
      id: "1",
      nombre: "Reducción de fugas",
      valorObjetivo: "10%",
      valoresMensuales: {
        "Ene": "15%",
        "Feb": "14%",
        "Mar": "13%",
        "Abr": "12%",
        "May": "11%",
        "Jun": "10%",
        "Jul": "9%",
        "Ago": "8%",
        "Set": "7%",
        "Oct": "6%",
        "Nov": "5%",
        "Dic": "4%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 50,
    },
    {
      id: "2",
      nombre: "Satisfacción del cliente",
      valorObjetivo: "95%",
      valoresMensuales: {
        "Ene": "85%",
        "Feb": "87%",
        "Mar": "89%",
        "Abr": "91%",
        "May": "93%",
        "Jun": "95%",
        "Jul": "96%",
        "Ago": "97%",
        "Set": "98%",
        "Oct": "99%",
        "Nov": "100%",
        "Dic": "100%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 75,
    },
    {
      id: "3",
      nombre: "Cobertura de servicio",
      valorObjetivo: "98%",
      valoresMensuales: {
        "Ene": "92%",
        "Feb": "93%",
        "Mar": "94%",
        "Abr": "95%",
        "May": "96%",
        "Jun": "97%",
        "Jul": "98%",
        "Ago": "98%",
        "Set": "99%",
        "Oct": "99%",
        "Nov": "100%",
        "Dic": "100%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 67,
    },
    {
      id: "4",
      nombre: "Eficiencia operativa",
      valorObjetivo: "90%",
      valoresMensuales: {
        "Ene": "78%",
        "Feb": "80%",
        "Mar": "82%",
        "Abr": "84%",
        "May": "86%",
        "Jun": "88%",
        "Jul": "90%",
        "Ago": "91%",
        "Set": "92%",
        "Oct": "93%",
        "Nov": "94%",
        "Dic": "95%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 60,
    },
  ])

  const [selectedMonth, setSelectedMonth] = useState(getMonthName(currentDate.month))
  const [selectedYear, setSelectedYear] = useState(currentDate.year.toString())
  const [viewType, setViewType] = useState<"mensual" | "anual">("mensual")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ actual: "", objetivo: "" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string>("")
  
  // Estado para modal de agregar variable
  const [addVariableDialogOpen, setAddVariableDialogOpen] = useState(false)
  const [newVariableName, setNewVariableName] = useState("")
  const [newVariableValues, setNewVariableValues] = useState<{[mes: string]: {valor: string, observaciones: string}}>({})
  const [isAddingVariable, setIsAddingVariable] = useState(false)
  
  // Estado para edición híbrida
  const [editingVariable, setEditingVariable] = useState<Objetivo | null>(null)
  const [editVariableDialogOpen, setEditVariableDialogOpen] = useState(false)
  const [editVariableValues, setEditVariableValues] = useState<{[mes: string]: {valor: string, observaciones: string}}>({})
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  
  // Estado para edición de fila específica
  const [editingRowId, setEditingRowId] = useState<string | null>(null)
  const [rowEditValues, setRowEditValues] = useState<{[mes: string]: string}>({})
  const [isSavingRow, setIsSavingRow] = useState(false)

  // Variables disponibles para seleccionar
  const variablesDisponibles = [
    "Cartera de clientes (mdp)",
    "Clientes domésticos", 
    "Clientes no domésticos",
    "Cortes de servicio",
    "Facturación total con IVA (mdp)",
    "Facturación total sin IVA (mdp)",
    "Número de clientes",
    "Número de clientes con servicio medido",
    "Número de clientes con servicio suspendido",
    "Número de reclamaciones en curso",
    "Número de reclamaciones registradas",
    "Número de reclamaciones resueltas",
    "Plazo medio de resolución (dias naturales)",
    "Recargos totales (mdp)",
    "Recaudación (mdp)",
    "Recaudación por cortes de servicio ejecutado",
    "Recaudación propia (mdp)",
    "Recibos (mdp)"
  ]

  const handleEdit = (objetivo: Objetivo) => {
    setEditingId(objetivo.id)
    setEditValues({ actual: "", objetivo: objetivo.valorObjetivo })
  }

  const handleSaveEdit = (id: string) => {
    if (!editValues.objetivo.trim()) {
      setValidationError("El valor objetivo no puede estar vacío")
      return
    }

    setObjetivos(
      objetivos.map((o) =>
        o.id === id
          ? {
              ...o,
              valorObjetivo: editValues.objetivo,
            }
          : o,
      ),
    )
    setEditingId(null)
    setValidationError("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValues({ actual: "", objetivo: "" })
    setValidationError("")
  }


  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setObjetivos(objetivos.filter((o) => o.id !== itemToDelete))
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleViewHistory = (id: string) => {
    console.log("Ver histórico de objetivo:", id)
  }

  // ==================== AGREGAR VARIABLE ====================
  const handleAddNew = () => {
    setNewVariableName("")
    setNewVariableValues({})
    setAddVariableDialogOpen(true)
  }

  const handleSaveVariable = async () => {
    if (!newVariableName.trim()) {
      setValidationError("El nombre de la variable es requerido")
      return
    }

    setIsAddingVariable(true)
    try {
      // Crear la nueva variable con valores mensuales
      const newVariable: Objetivo = {
        id: Date.now().toString(),
        nombre: newVariableName,
        valorObjetivo: "100%", // Valor objetivo por defecto
        valoresMensuales: Object.keys(newVariableValues).reduce((acc, mes) => {
          acc[mes] = newVariableValues[mes].valor || "-"
          return acc
        }, {} as {[mes: string]: string}),
        periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
        progreso: 0,
      }

      setObjetivos([...objetivos, newVariable])
      setAddVariableDialogOpen(false)
      setNewVariableName("")
      setNewVariableValues({})
      setValidationError("")
    } catch (error) {
      console.error("Error agregando variable:", error)
    } finally {
      setIsAddingVariable(false)
    }
  }

  const handleCancelAddVariable = () => {
    setAddVariableDialogOpen(false)
    setNewVariableName("")
    setNewVariableValues({})
    setValidationError("")
  }

  const updateVariableValue = (mes: string, field: 'valor' | 'observaciones', value: string) => {
    setNewVariableValues(prev => ({
      ...prev,
      [mes]: {
        ...prev[mes],
        [field]: value
      }
    }))
  }

  // Validar si todos los campos están llenos
  const isFormValid = () => {
    if (!newVariableName.trim()) return false
    
    const months = generateMonths()
    return months.every(mes => {
      const monthData = newVariableValues[mes]
      return monthData && monthData.valor && monthData.valor.trim() !== ""
    })
  }

  const selectPreloadedVariable = (variableName: string) => {
    setNewVariableName(variableName)
    // No precargar valores, solo seleccionar la variable
    setNewVariableValues({})
  }

  // ==================== EDICIÓN HÍBRIDA ====================

  // Edición completa - modal
  const startFullEdit = (objetivo: Objetivo) => {
    setEditingVariable(objetivo)
    setEditVariableValues(
      Object.keys(objetivo.valoresMensuales).reduce((acc, mes) => {
        const valor = objetivo.valoresMensuales[mes]
        acc[mes] = {
          valor: typeof valor === 'string' ? valor : (valor?.valor || ""),
          observaciones: "" // Las observaciones no están en el modelo actual
        }
        return acc
      }, {} as {[mes: string]: {valor: string, observaciones: string}})
    )
    setEditVariableDialogOpen(true)
  }

  // Guardar edición completa
  const saveFullEdit = async () => {
    if (!editingVariable) return
    
    setIsSavingEdit(true)
    try {
      setObjetivos(prev => prev.map(obj => 
        obj.id === editingVariable.id 
          ? {
              ...obj,
              valoresMensuales: Object.keys(editVariableValues).reduce((acc, mes) => {
                acc[mes] = editVariableValues[mes].valor || "-"
                return acc
              }, {} as {[mes: string]: string})
            }
          : obj
      ))
      
      setEditVariableDialogOpen(false)
      setEditingVariable(null)
      setEditVariableValues({})
    } catch (error) {
      console.error("Error guardando edición:", error)
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Cancelar edición completa
  const cancelFullEdit = () => {
    setEditVariableDialogOpen(false)
    setEditingVariable(null)
    setEditVariableValues({})
  }

  // Actualizar valor en edición completa
  const updateEditVariableValue = (mes: string, field: 'valor' | 'observaciones', value: string) => {
    setEditVariableValues(prev => ({
      ...prev,
      [mes]: {
        ...prev[mes],
        [field]: value
      }
    }))
  }

  // ==================== EDICIÓN DE FILA ESPECÍFICA ====================
  
  // Iniciar edición de fila específica
  const startRowEdit = (objetivo: Objetivo) => {
    setEditingRowId(objetivo.id)
    setRowEditValues({...objetivo.valoresMensuales})
  }

  // Guardar edición de fila específica
  const saveRowEdit = async () => {
    if (!editingRowId) return
    
    setIsSavingRow(true)
    try {
      setObjetivos(prev => prev.map(obj => 
        obj.id === editingRowId 
          ? {
              ...obj,
              valoresMensuales: rowEditValues
            }
          : obj
      ))
      
      setEditingRowId(null)
      setRowEditValues({})
    } catch (error) {
      console.error("Error guardando edición de fila:", error)
    } finally {
      setIsSavingRow(false)
    }
  }

  // Cancelar edición de fila específica
  const cancelRowEdit = () => {
    setEditingRowId(null)
    setRowEditValues({})
  }

  // Actualizar valor en edición de fila
  const updateRowEditValue = (mes: string, value: string) => {
    setRowEditValues(prev => ({
      ...prev,
      [mes]: value
    }))
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/indicadores")}
          className="text-slate-400 hover:text-white hover:bg-slate-800 self-start"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Objetivos guardados</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestiona los objetivos y metas del sistema</p>
        </div>
        
        {/* Toggle de vista centrado */}
        <div className="flex items-center justify-center w-full sm:w-auto mt-4 sm:mt-0">
          <Tabs value={viewType} onValueChange={(value: "mensual" | "anual") => setViewType(value)} className="w-auto">
            <TabsList className="bg-white border border-gray-200 shadow-sm">
              <TabsTrigger value="mensual" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                Mensual
              </TabsTrigger>
              <TabsTrigger value="anual" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Anual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Card className="border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-gray-900 text-lg sm:text-xl flex items-center gap-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                Objetivos guardados: {objetivos.length}/20
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm sm:text-base">
                Administra los objetivos y su progreso por periodo
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              {viewType === "mensual" && (
                        <div className="flex gap-2">
                          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                            <SelectTrigger className="w-20 sm:w-24 bg-white border-gray-300 text-gray-700 text-xs sm:text-sm hover:border-blue-400 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {availableMonths.map((month) => (
                                <SelectItem key={month.value} value={month.value} className="text-gray-700 focus:bg-blue-50 text-xs sm:text-sm">
                                  {month.value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-20 sm:w-24 bg-white border-gray-300 text-gray-700 text-xs sm:text-sm hover:border-blue-400 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()} className="text-gray-700 focus:bg-blue-50 text-xs sm:text-sm">
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
              )}
              
              {viewType === "anual" && (
                        <div className="flex gap-2">
                          <Select value={selectedYear} onValueChange={setSelectedYear}>
                            <SelectTrigger className="w-20 sm:w-24 bg-white border-gray-300 text-gray-700 text-xs sm:text-sm hover:border-blue-400 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {years.map((year) => (
                                <SelectItem key={year} value={year.toString()} className="text-gray-700 focus:bg-blue-50 text-xs sm:text-sm">
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
              )}
              
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Agregar Objetivo</span>
                <span className="sm:hidden">Agregar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {viewType === "mensual" ? (
              // Vista mensual (tabla tradicional simplificada)
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-center px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Objetivo</th>
                    <th className="text-center px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Valor Objetivo</th>
                    <th className="text-center px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Progreso</th>
                    <th className="text-center px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {objetivos.map((objetivo) => (
                    <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-900 max-w-[150px] truncate" title={objetivo.nombre}>
                        {objetivo.nombre}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center text-xs sm:text-sm">
                        <span className="text-blue-600 font-medium">{objetivo.valorObjetivo}</span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px] sm:max-w-[100px]">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${objetivo.progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 sm:w-10">{objetivo.progreso}%</span>
                        </div>
                      </td>
                            <td className="px-3 sm:px-6 py-3 sm:py-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleEdit(objetivo)}
                                  variant="outline"
                                  className="h-10 w-10 p-0 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 transition-all duration-200"
                                  title="Editar"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleViewHistory(objetivo.id)}
                                  variant="outline"
                                  className="h-10 w-10 p-0 rounded-xl border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                                  title="Ver Histórico"
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleDeleteClick(objetivo.id)}
                                  variant="outline"
                                  className="h-10 w-10 p-0 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-200"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              // Vista anual (matriz con todos los meses)
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px]">
                      Variable
                    </th>
                    {generateMonths().map((mes) => (
                      <th key={mes} className="text-center px-2 py-3 text-xs font-semibold text-gray-700 min-w-[60px]">
                        {mes}
                      </th>
                    ))}
                    <th className="text-center px-3 py-3 text-xs font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10 min-w-[120px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {objetivos.map((objetivo) => (
                    <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 text-center text-xs text-gray-900 sticky left-0 bg-white z-10 font-medium" title={objetivo.nombre}>
                        {objetivo.nombre}
                      </td>
                      {generateMonths().map((mes) => (
                        <td key={mes} className="px-2 py-3 text-center text-xs">
                          {editingRowId === objetivo.id ? (
                            <Input
                              value={rowEditValues[mes] || ""}
                              onChange={(e) => updateRowEditValue(mes, e.target.value)}
                              className="w-20 h-6 text-xs"
                              placeholder="Valor"
                            />
                          ) : (
                            <span className="text-blue-600 font-medium">
                              {(() => {
                                const valor = objetivo.valoresMensuales[mes]
                                return typeof valor === 'string' ? valor : (valor?.valor || "-")
                              })()}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="px-3 py-3 text-center sticky right-0 bg-white z-10">
                        <div className="flex items-center justify-center gap-2">
                          {editingRowId === objetivo.id ? (
                            <>
                              <Button
                                size="sm"
                                onClick={saveRowEdit}
                                variant="outline"
                                disabled={isSavingRow}
                                className="h-10 w-10 p-0 rounded-xl border-2 border-green-500 text-green-500 hover:bg-green-50 hover:border-green-600 hover:text-green-600 transition-all duration-200"
                                title="Guardar Cambios"
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={cancelRowEdit}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-gray-500 text-gray-500 hover:bg-gray-50 hover:border-gray-600 hover:text-gray-600 transition-all duration-200"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                onClick={() => startRowEdit(objetivo)}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-50 hover:border-emerald-600 hover:text-emerald-600 transition-all duration-200"
                                title="Editar Fila"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startFullEdit(objetivo)}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 transition-all duration-200"
                                title="Editar Todo"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleViewHistory(objetivo.id)}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-600 transition-all duration-200"
                                title="Ver Histórico"
                              >
                                <History className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleDeleteClick(objetivo.id)}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-200"
                                title="Eliminar"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Modal para agregar variable */}
      <Dialog open={addVariableDialogOpen} onOpenChange={setAddVariableDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-blue-600" />
              Agregar Nueva Variable
            </DialogTitle>
            <DialogDescription>
              Selecciona una variable disponible y completa los valores mensuales
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Selector de variable */}
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Seleccionar Variable</Label>
                    <Select value={newVariableName} onValueChange={(value) => {
                      selectPreloadedVariable(value)
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona una variable disponible..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {variablesDisponibles.map((variable, index) => (
                          <SelectItem key={index} value={variable}>
                            <span className="font-medium">{variable}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
              {validationError && (
                <div className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {validationError}
                </div>
              )}
            </div>

            {/* Valores mensuales - Grid simple */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium text-gray-900">Valores Mensuales</h3>
                <div className="text-sm text-gray-500">
                  {(() => {
                    const months = generateMonths()
                    const filledMonths = months.filter(mes => {
                      const monthData = newVariableValues[mes]
                      return monthData && monthData.valor && monthData.valor.trim() !== ""
                    }).length
                    return `${filledMonths}/${months.length} meses completados`
                  })()}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {generateMonths().map((mes) => (
                  <div key={mes} className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <div className="text-sm font-medium text-gray-700">{mes}</div>
                    <Input
                      value={newVariableValues[mes]?.valor || ""}
                      onChange={(e) => updateVariableValue(mes, 'valor', e.target.value)}
                      placeholder="Valor"
                      className="text-sm"
                    />
                    <Input
                      value={newVariableValues[mes]?.observaciones || ""}
                      onChange={(e) => updateVariableValue(mes, 'observaciones', e.target.value)}
                      placeholder="Observaciones"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelAddVariable}
              disabled={isAddingVariable}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveVariable}
              disabled={isAddingVariable || !isFormValid()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAddingVariable ? "Guardando..." : "Guardar Variable"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de edición completa */}
      <Dialog open={editVariableDialogOpen} onOpenChange={setEditVariableDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Pencil className="h-5 w-5 text-amber-600" />
              Editar Variable: {editingVariable?.nombre}
            </DialogTitle>
            <DialogDescription>
              Modifica los valores mensuales de esta variable
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Valores mensuales - Grid simple */}
            <div className="space-y-3">
              <h3 className="text-base font-medium text-gray-900">Valores Mensuales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {generateMonths().map((mes) => (
                  <div key={mes} className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <div className="text-sm font-medium text-gray-700">{mes}</div>
                    <Input
                      value={editVariableValues[mes]?.valor || ""}
                      onChange={(e) => updateEditVariableValue(mes, 'valor', e.target.value)}
                      placeholder="Valor"
                      className="text-sm"
                    />
                    <Input
                      value={editVariableValues[mes]?.observaciones || ""}
                      onChange={(e) => updateEditVariableValue(mes, 'observaciones', e.target.value)}
                      placeholder="Observaciones"
                      className="text-sm"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={cancelFullEdit}
              disabled={isSavingEdit}
            >
              Cancelar
            </Button>
            <Button
              onClick={saveFullEdit}
              disabled={isSavingEdit}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {isSavingEdit ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El objetivo será eliminado permanentemente del sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
