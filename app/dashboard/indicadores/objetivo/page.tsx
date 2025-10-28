"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Target, Pencil, Check, X, History, Trash2, AlertCircle, Calendar, BarChart3, Edit3, ChevronLeft, ChevronRight } from "lucide-react"
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
    // Generar solo 6 años centrados en el año actual (2 filas x 3 columnas)
    const years = []
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      years.push(i)
    }
    return years
  }

  // Generar años disponibles para agregar variables (años sin variables registradas)
  const generateAvailableYearsForNewVariable = () => {
    // Usar el estado dinámico de años en lugar de un rango fijo
    const allYears = [...years]
    
    // Obtener años que ya tienen variables registradas
    const yearsWithVariables = new Set(
      objetivos.map(obj => {
        // Extraer año del periodo (formato: "Jul 2025")
        const yearMatch = obj.periodo.match(/\d{4}/)
        return yearMatch ? parseInt(yearMatch[0]) : null
      }).filter(year => year !== null)
    )
    
    // Retornar solo años que NO tienen variables
    return allYears.filter(year => !yearsWithVariables.has(year))
  }

  const generateMonths = () => {
    return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  }

  const [currentDate] = useState(getCurrentDate())
  const [availableMonths] = useState(generateAvailableMonths())
  const [years, setYears] = useState(generateYears())

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
    {
      id: "5",
      nombre: "Tiempo promedio de respuesta",
      valorObjetivo: "2.5 horas",
      valoresMensuales: {
        "Ene": "4.2 horas",
        "Feb": "3.8 horas",
        "Mar": "3.5 horas",
        "Abr": "3.2 horas",
        "May": "3.0 horas",
        "Jun": "2.8 horas",
        "Jul": "2.6 horas",
        "Ago": "2.5 horas",
        "Set": "2.4 horas",
        "Oct": "2.3 horas",
        "Nov": "2.2 horas",
        "Dic": "2.1 horas"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 85,
    },
    {
      id: "6",
      nombre: "Cumplimiento de presupuesto",
      valorObjetivo: "95%",
      valoresMensuales: {
        "Ene": "88%",
        "Feb": "89%",
        "Mar": "90%",
        "Abr": "91%",
        "May": "92%",
        "Jun": "93%",
        "Jul": "94%",
        "Ago": "94%",
        "Set": "95%",
        "Oct": "95%",
        "Nov": "96%",
        "Dic": "97%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 72,
    },
    {
      id: "7",
      nombre: "Capacitación del personal",
      valorObjetivo: "100%",
      valoresMensuales: {
        "Ene": "75%",
        "Feb": "80%",
        "Mar": "85%",
        "Abr": "88%",
        "May": "90%",
        "Jun": "92%",
        "Jul": "94%",
        "Ago": "96%",
        "Set": "98%",
        "Oct": "99%",
        "Nov": "100%",
        "Dic": "100%"
      },
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 88,
    },
  ])

  const [selectedMonth, setSelectedMonth] = useState(getMonthName(currentDate.month))
  const [selectedYear, setSelectedYear] = useState(currentDate.year.toString())
  const [viewType, setViewType] = useState<"mensual" | "anual">("anual")
  
  // Estado para selector de año en vista anual
  const [selectedYearForAnnual, setSelectedYearForAnnual] = useState(currentDate.year)
  
  // Funciones para navegación de años
  const navigateYear = (direction: 'prev' | 'next') => {
    const newYear = direction === 'prev' ? selectedYearForAnnual - 1 : selectedYearForAnnual + 1
    
    // Verificar si el nuevo año está fuera del rango actual de años
    const minYear = Math.min(...years)
    const maxYear = Math.max(...years)
    
    if (newYear < minYear || newYear > maxYear) {
      // Generar exactamente 6 años centrados en el nuevo año (2 filas x 3 columnas)
      const newYears = []
      for (let i = newYear - 2; i <= newYear + 3; i++) {
        newYears.push(i)
      }
      setYears(newYears)
    }
    
    setSelectedYearForAnnual(newYear)
  }
  
  const selectYearForAnnual = (year: number) => {
    setSelectedYearForAnnual(year)
  }
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
  const [selectedYearForNewVariable, setSelectedYearForNewVariable] = useState(currentDate.year.toString())
  
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
    setSelectedYearForNewVariable(currentDate.year.toString())
    setAddVariableDialogOpen(true)
  }

  const handleSaveVariable = async () => {
    if (!newVariableName.trim()) {
      setValidationError("El nombre de la variable es requerido")
      return
    }

    setIsAddingVariable(true)
    try {
      // Crear la nueva variable con valores mensuales para el año seleccionado
      const newVariable: Objetivo = {
        id: Date.now().toString(),
        nombre: newVariableName,
        valorObjetivo: "100%", // Valor objetivo por defecto
        valoresMensuales: Object.keys(newVariableValues).reduce((acc, mes) => {
          acc[mes] = newVariableValues[mes].valor || "-"
          return acc
        }, {} as {[mes: string]: string}),
        periodo: `${getMonthName(currentDate.month)} ${selectedYearForNewVariable}`, // Usar el año seleccionado
        progreso: 0,
      }

      setObjetivos([...objetivos, newVariable])
      setAddVariableDialogOpen(false)
      setNewVariableName("")
      setNewVariableValues({})
      setSelectedYearForNewVariable(currentDate.year.toString())
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
    setSelectedYearForNewVariable(currentDate.year.toString())
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
    if (!selectedYearForNewVariable) return false
    
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
    <div className="space-y-2 sm:space-y-3 w-full mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl 2xl:max-w-[90vw] 3xl:max-w-[85vw]">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Objetivos</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Gestiona los objetivos y metas del sistema</p>
        </div>
        
        {/* Toggle de vista centrado */}
        <div className="flex items-center justify-center w-full sm:w-auto mt-4 sm:mt-0">
          <Tabs value={viewType} onValueChange={(value: "mensual" | "anual") => setViewType(value)} className="w-auto">
            <TabsList className="bg-white border border-gray-200 shadow-sm">
              <TabsTrigger value="anual" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
                <BarChart3 className="h-4 w-4 mr-2" />
                Anual
              </TabsTrigger>
              <TabsTrigger value="mensual" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
                <Calendar className="h-4 w-4 mr-2" />
                Mensual
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Selector de Período para Vista Anual */}
      {viewType === "anual" && (
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
                  value={selectedYearForAnnual.toString()} 
                  onValueChange={(value) => selectYearForAnnual(parseInt(value))}
                >
                  <SelectTrigger className="w-24 h-8 text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-xs">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Navegación de años */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('prev')}
                className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-8 w-8 p-0 rounded-lg shadow-sm transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Container de años */}
              <div className="flex-1">
                <div className="grid grid-cols-3 xl:grid-cols-6 gap-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-1.5 shadow-inner">
                  {years.map((year) => {
                    const isSelected = selectedYearForAnnual === year
                    
                    return (
                      <button
                        key={year}
                        onClick={() => selectYearForAnnual(year)}
                        className={`px-2 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                        }`}
                      >
                        {year}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('next')}
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
                      Visualizando: <span className="font-bold text-blue-800">{selectedYearForAnnual}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-gray-200 bg-white shadow-md">
        <CardHeader className="border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl sm:text-2xl text-gray-900">
                Objetivos: {objetivos.length}/20
              </CardTitle>
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
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[200px] xl:min-w-[300px]">Objetivo</th>
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[120px] xl:min-w-[150px]">Valor Objetivo</th>
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px] xl:min-w-[200px]">Progreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {objetivos.map((objetivo) => (
                    <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-900 max-w-[200px] xl:max-w-[300px] truncate" title={objetivo.nombre}>
                        {objetivo.nombre}
                      </td>
                      <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center text-xs sm:text-sm">
                        <span className="text-blue-600 font-medium">{objetivo.valorObjetivo}</span>
                      </td>
                      <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-1 sm:gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px] sm:max-w-[100px] xl:max-w-[150px]">
                            <div
                              className="h-full bg-blue-600 transition-all"
                              style={{ width: `${objetivo.progreso}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 sm:w-10 xl:w-12">{objetivo.progreso}%</span>
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
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[150px] xl:min-w-[200px]">
                      Variable
                    </th>
                    {generateMonths().map((mes) => (
                      <th key={mes} className="text-center px-2 xl:px-4 py-3 text-xs font-semibold text-gray-700 min-w-[60px] xl:min-w-[80px]">
                        {mes}
                      </th>
                    ))}
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10 min-w-[120px] xl:min-w-[180px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {objetivos.map((objetivo) => (
                    <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 xl:px-6 py-3 text-center text-xs text-gray-900 sticky left-0 bg-white z-10 font-medium max-w-[150px] xl:max-w-[200px] truncate" title={objetivo.nombre}>
                        {objetivo.nombre}
                      </td>
                      {generateMonths().map((mes) => (
                        <td key={mes} className="px-2 xl:px-4 py-3 text-center text-xs">
                          {editingRowId === objetivo.id ? (
                            <Input
                              value={rowEditValues[mes] || ""}
                              onChange={(e) => updateRowEditValue(mes, e.target.value)}
                              className="w-20 xl:w-24 h-6 text-xs"
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
                      <td className="px-3 xl:px-6 py-3 text-center sticky right-0 bg-white z-10">
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
                                className="h-10 w-10 p-0 rounded-xl border-2 border-orange-500 text-orange-500 hover:bg-orange-50 hover:border-orange-600 hover:text-orange-600 transition-all duration-200"
                                title="Editar Fila"
                              >
                                <Edit3 className="h-4 w-4" />
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
            {/* Selectores en línea */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Selector de año */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Año</Label>
                <Select value={selectedYearForNewVariable} onValueChange={setSelectedYearForNewVariable}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Año..." />
                  </SelectTrigger>
                  <SelectContent>
                    {generateAvailableYearsForNewVariable().map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        <span className="font-medium">{year}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selector de variable */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Variable</Label>
                <Select value={newVariableName} onValueChange={(value) => {
                  selectPreloadedVariable(value)
                }}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Variable..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {variablesDisponibles.map((variable, index) => (
                      <SelectItem key={index} value={variable}>
                        <span className="font-medium">{variable}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Texto informativo */}
            <p className="text-xs text-gray-500">
              Solo se muestran años sin variables registradas
            </p>

            {validationError && (
              <div className="flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {validationError}
              </div>
            )}

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
