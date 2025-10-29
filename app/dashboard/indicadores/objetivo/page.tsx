"use client"

import { useState, useEffect } from "react"
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
  valoresMensuales: { [mes: string]: string }  // Objetivos por mes
  valoresReales?: { [mes: string]: string }     // Valores reales por mes
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

    // Generate all 12 months
    for (let i = 0; i < 12; i++) {
      months.push({
        value: getMonthName(i),
        index: i,
        year: current.year,
      })
    }

    return months
  }

  const YEARS_PER_PAGE = 6 // Número de años a mostrar por página
  
  // Generar rango de años disponibles (más amplio para navegación)
  const generateAllYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    // Generar años desde hace 10 años hasta 10 años en el futuro
    for (let i = currentYear - 10; i <= currentYear + 10; i++) {
      years.push(i)
    }
    return years
  }

  const generateYears = () => {
    const currentYear = new Date().getFullYear()
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1, currentYear + 2, currentYear + 3]
  }

  // Generar años disponibles para agregar variables (años sin variables registradas)
  const generateAvailableYearsForNewVariable = () => {
    const currentYear = new Date().getFullYear()
    // Generar solo años del actual hacia adelante (no mostrar años pasados)
    const allYears = []
    for (let i = currentYear; i <= currentYear + 10; i++) {
      allYears.push(i)
    }
    
    // Usar yearsWithData del API (más preciso que leer de objetivos locales)
    // Retornar solo años que NO tienen datos registrados
    return allYears.filter(year => !yearsWithData.includes(year))
  }

  const generateMonths = () => {
    return ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
  }

  const [currentDate] = useState(getCurrentDate())
  const [availableMonths] = useState(generateAvailableMonths())
  const [years] = useState(generateYears())
  const [allYears] = useState(generateAllYears())
  
  // Estado para el rango de años visibles (paginación)
  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const currentYear = new Date().getFullYear()
    // Centrar el año actual en el rango visible
    return currentYear - 2
  })

  const [objetivos, setObjetivos] = useState<Objetivo[]>([])
  const [loadingObjetivos, setLoadingObjetivos] = useState(false)
  const [yearsWithData, setYearsWithData] = useState<number[]>([])

  const [selectedMonth, setSelectedMonth] = useState(getMonthName(currentDate.month))
  const [selectedYear, setSelectedYear] = useState(currentDate.year.toString())
  const [viewType, setViewType] = useState<"mensual" | "anual">("anual")
  
  // Estado para selector de año en vista anual
  const [selectedYearForAnnual, setSelectedYearForAnnual] = useState(currentDate.year)
  
  // Obtener años visibles en el rango actual
  const getVisibleYears = () => {
    return allYears.slice(
      allYears.indexOf(yearRangeStart),
      allYears.indexOf(yearRangeStart) + YEARS_PER_PAGE
    )
  }
  
  // Funciones para navegación de años (paginación)
  const navigateYear = (direction: 'prev' | 'next') => {
    const currentIndex = allYears.indexOf(yearRangeStart)
    
    if (direction === 'prev' && currentIndex > 0) {
      // Navegar hacia atrás una página completa
      const newStartIndex = Math.max(0, currentIndex - YEARS_PER_PAGE)
      setYearRangeStart(allYears[newStartIndex])
    } else if (direction === 'next' && currentIndex + YEARS_PER_PAGE < allYears.length) {
      // Navegar hacia adelante una página completa
      const newStartIndex = Math.min(allYears.length - YEARS_PER_PAGE, currentIndex + YEARS_PER_PAGE)
      setYearRangeStart(allYears[newStartIndex])
    }
  }
  
  const selectYearForAnnual = (year: number) => {
    setSelectedYearForAnnual(year)
    
    // Si el año seleccionado no está en el rango visible, ajustar el rango
    const visibleYears = getVisibleYears()
    if (!visibleYears.includes(year)) {
      // Centrar el año seleccionado en el nuevo rango
      const yearIndex = allYears.indexOf(year)
      const newStartIndex = Math.max(0, Math.min(allYears.length - YEARS_PER_PAGE, yearIndex - Math.floor(YEARS_PER_PAGE / 2)))
      setYearRangeStart(allYears[newStartIndex])
    }
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

  // Cargar objetivos desde la base de datos
  useEffect(() => {
    const fetchObjetivos = async () => {
      setLoadingObjetivos(true)
      try {
        // Determinar qué año usar según la vista
        const yearToFetch = viewType === 'anual' ? selectedYearForAnnual : parseInt(selectedYear)
        
        const response = await fetch(`/api/objetivos?year=${yearToFetch}`)
        const result = await response.json()
        
        if (result.success) {
          // console.log('✅ Objetivos cargados:', result.data?.length || 0)
          setObjetivos(result.data || [])
          // Guardar años que tienen datos (solo si vienen en la respuesta)
          if (result.years && result.years.length > 0) {
            setYearsWithData(result.years)
          }
        } else {
          console.error('❌ Error al cargar objetivos:', result.message)
          setObjetivos([])
        }
      } catch (error) {
        console.error('❌ Error fetching objetivos:', error)
        setObjetivos([])
      } finally {
        setLoadingObjetivos(false)
      }
    }

    fetchObjetivos()
  }, [selectedYearForAnnual, selectedYear, selectedMonth, viewType])

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

    // Validar que todos los campos sean válidos
    if (!isFormValid()) {
      setValidationError("Por favor completa todos los meses con valores válidos")
      return
    }

    setIsAddingVariable(true)
    setValidationError("")
    
    try {
      // Llamar al API para guardar en la base de datos
      const response = await fetch('/api/objetivos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreVariable: newVariableName,
          year: parseInt(selectedYearForNewVariable),
          valoresMensuales: newVariableValues
        })
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al guardar objetivos')
      }

      console.log('✅ Objetivos guardados:', result)

      // Cerrar modal y limpiar
      setAddVariableDialogOpen(false)
      setNewVariableName("")
      setNewVariableValues({})
      setSelectedYearForNewVariable(currentDate.year.toString())
      
      // Recargar objetivos desde la BD
      await fetchObjetivos(selectedYearForAnnual)

    } catch (error: any) {
      console.error("❌ Error guardando objetivos:", error)
      setValidationError(error.message || "Error al guardar los objetivos. Intenta de nuevo.")
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

  // Instrucciones dinámicas solo para variables específicas
  const getVariableInstructions = (variableName: string) => {
    const instrucciones: { [key: string]: { descripcion: string } } = {
      "Número de clientes": {
        descripcion: "Ingresa el número total de clientes. Solo números enteros sin decimales."
      },
      "Facturación total sin IVA (mdp)": {
        descripcion: "Ingresa la facturación en millones de pesos. Usa punto (.) como decimal."
      },
      "Recaudación (mdp)": {
        descripcion: "Ingresa la recaudación en millones de pesos. Usa punto (.) como decimal."
      }
    }

    // Solo devolver si está en el catálogo, sino null
    return instrucciones[variableName] || null
  }

  // Función para normalizar y validar números ingresados
  const normalizeNumberInput = (value: string): string => {
    if (!value || value.trim() === '') return ''
    
    // Paso 1: Eliminar espacios
    let cleaned = value.replace(/\s/g, '')
    
    // Paso 2: Reemplazar comas por puntos (formato decimal europeo)
    cleaned = cleaned.replace(/,/g, '.')
    
    // Paso 3: Eliminar todo excepto números, punto y signo negativo
    cleaned = cleaned.replace(/[^\d.-]/g, '')
    
    // Paso 4: Asegurar solo un punto decimal
    const parts = cleaned.split('.')
    if (parts.length > 2) {
      cleaned = parts[0] + '.' + parts.slice(1).join('')
    }
    
    // Paso 5: Permitir solo un signo negativo al inicio
    const negativeMatch = cleaned.match(/^-/)
    cleaned = cleaned.replace(/-/g, '')
    if (negativeMatch) {
      cleaned = '-' + cleaned
    }
    
    return cleaned
  }

  // Función para validar si un valor es un número válido
  const isValidNumber = (value: string): boolean => {
    if (!value || value.trim() === '') return true // Vacío es válido (no obligatorio)
    if (value === '-' || value === '.') return false // Incompletos
    const num = parseFloat(value)
    return !isNaN(num) && isFinite(num)
  }

  const updateVariableValue = (mes: string, field: 'valor' | 'observaciones', value: string) => {
    // Si es el campo 'valor', normalizar el input
    const finalValue = field === 'valor' ? normalizeNumberInput(value) : value
    
    setNewVariableValues(prev => ({
      ...prev,
      [mes]: {
        ...prev[mes],
        [field]: finalValue
      }
    }))
  }

  // Validar si todos los campos están llenos y son válidos
  const isFormValid = () => {
    if (!newVariableName.trim()) return false
    if (!selectedYearForNewVariable) return false
    
    const months = generateMonths()
    return months.every(mes => {
      const monthData = newVariableValues[mes]
      // Verificar que existe, tiene valor, y el valor es un número válido
      if (!monthData || !monthData.valor || monthData.valor.trim() === "") return false
      return isValidNumber(monthData.valor)
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
            </div>
            
            {/* Navegación de años */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('prev')}
                disabled={allYears.indexOf(yearRangeStart) === 0}
                className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-8 w-8 p-0 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={allYears.indexOf(yearRangeStart) === 0 ? "No hay años anteriores" : `Mostrar años ${yearRangeStart - YEARS_PER_PAGE} - ${yearRangeStart - 1}`}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Container de años */}
              <div className="flex-1 relative">
                <div className="grid grid-cols-3 xl:grid-cols-6 gap-1 bg-gradient-to-r from-gray-100 to-gray-50 rounded-lg p-1.5 shadow-inner">
                  {getVisibleYears().map((year) => {
                    const isSelected = selectedYearForAnnual === year
                    const hasData = yearsWithData.includes(year)
                    
                    return (
                      <button
                        key={year}
                        onClick={() => selectYearForAnnual(year)}
                        className={`px-2 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-all duration-200 whitespace-nowrap relative ${
                          isSelected
                            ? hasData
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg opacity-70'
                            : hasData
                              ? 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-sm opacity-60'
                        }`}
                        title={hasData ? `Ver datos del año ${year}` : `No hay datos para ${year} (Previsualizar)`}
                      >
                        {year}
                        {!hasData && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full" title="Sin datos"></span>
                        )}
                      </button>
                    )
                  })}
                </div>
                
                {/* Indicadores visuales de más años disponibles */}
                {allYears.indexOf(yearRangeStart) > 0 && (
                  <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-gray-300/50 to-transparent pointer-events-none rounded-l-lg flex items-center">
                    <div className="text-gray-500 text-xs ml-0.5">...</div>
                  </div>
                )}
                {allYears.indexOf(yearRangeStart) + YEARS_PER_PAGE < allYears.length && (
                  <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-gray-300/50 to-transparent pointer-events-none rounded-r-lg flex items-center justify-end">
                    <div className="text-gray-500 text-xs mr-0.5">...</div>
                  </div>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('next')}
                disabled={allYears.indexOf(yearRangeStart) + YEARS_PER_PAGE >= allYears.length}
                className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-8 w-8 p-0 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title={allYears.indexOf(yearRangeStart) + YEARS_PER_PAGE >= allYears.length ? "No hay años siguientes" : `Mostrar años ${yearRangeStart + YEARS_PER_PAGE} - ${yearRangeStart + (YEARS_PER_PAGE * 2) - 1}`}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Información del período seleccionado */}
            <div className="mt-2 pt-2 border-t border-gray-200">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center">
                  <div className={`flex items-center gap-1.5 border px-3 py-1 rounded-lg shadow-sm ${
                    yearsWithData.includes(selectedYearForAnnual)
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200'
                      : 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'
                  }`}>
                    <Calendar className={`h-3.5 w-3.5 ${yearsWithData.includes(selectedYearForAnnual) ? 'text-blue-600' : 'text-orange-500'}`} />
                    <div className="text-center sm:text-left">
                      <div className={`text-xs font-semibold ${yearsWithData.includes(selectedYearForAnnual) ? 'text-blue-600' : 'text-orange-600'}`}>
                        Visualizando: <span className={`font-bold ${yearsWithData.includes(selectedYearForAnnual) ? 'text-blue-800' : 'text-orange-700'}`}>{selectedYearForAnnual}</span>
                        {!yearsWithData.includes(selectedYearForAnnual) && (
                          <span className="ml-1 text-[10px] text-orange-600">(Vacío)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Leyenda de estados */}
                <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-gray-500">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-600 to-blue-500 rounded"></div>
                    <span>Año Seleccionado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                    <span>Año vacío</span>
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
              <CardTitle className="text-xl sm:text-2xl text-gray-900 flex items-center gap-2">
                <span>Objetivos</span>
                <span className="text-base font-normal text-gray-500">
                  ({objetivos.length} {objetivos.length === 1 ? 'registro' : 'registros'})
                </span>
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
              
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm">
                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Agregar Objetivos Anuales</span>
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
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[180px] xl:min-w-[250px]">Objetivo</th>
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[100px] xl:min-w-[120px]">Valor Objetivo</th>
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[100px] xl:min-w-[120px]">Real</th>
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px] xl:min-w-[180px]">Progreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loadingObjetivos ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-gray-500">Cargando objetivos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : objetivos.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertCircle className="h-12 w-12 text-gray-300" />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-600">Sin objetivos para {selectedMonth} {selectedYear}</p>
                            <p className="text-sm text-gray-400">No hay objetivos registrados para este período</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : objetivos.map((objetivo) => {
                    // Obtener valores del mes seleccionado
                    const valorObjetivoMes = objetivo.valoresMensuales ? objetivo.valoresMensuales[selectedMonth] : '-'
                    const valorReal = objetivo.valoresReales ? objetivo.valoresReales[selectedMonth] : '-'
                    
                    const valorObjetivoNum = parseFloat(valorObjetivoMes) || 0
                    const valorRealNum = parseFloat(valorReal) || 0
                    
                    // Calcular progreso basado en valor real vs objetivo
                    const progresoCalculado = valorObjetivoNum > 0 ? Math.min(100, Math.round((valorRealNum / valorObjetivoNum) * 100)) : 0
                    
                    return (
                      <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-900 max-w-[180px] xl:max-w-[250px] truncate" title={objetivo.nombre}>
                          {objetivo.nombre}
                        </td>
                        <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center text-xs sm:text-sm">
                          <span className="text-blue-600 font-medium">{valorObjetivoMes}</span>
                        </td>
                        <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center text-xs sm:text-sm">
                          <span className={`font-medium ${valorReal !== '-' ? 'text-green-600' : 'text-gray-400'}`}>{valorReal}</span>
                        </td>
                        <td className="px-3 sm:px-6 xl:px-8 py-3 sm:py-4 text-center">
                          <div className="flex items-center justify-center gap-1 sm:gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px] sm:max-w-[100px] xl:max-w-[150px]">
                              <div
                                className={`h-full transition-all ${
                                  progresoCalculado >= 100 ? 'bg-green-600' : 
                                  progresoCalculado >= 70 ? 'bg-blue-600' : 
                                  progresoCalculado >= 40 ? 'bg-yellow-600' : 'bg-red-600'
                                }`}
                                style={{ width: `${progresoCalculado}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-8 sm:w-10 xl:w-12">{progresoCalculado}%</span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
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
                  {loadingObjetivos ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <p className="text-sm text-gray-500">Cargando objetivos...</p>
                        </div>
                      </td>
                    </tr>
                  ) : objetivos.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <AlertCircle className="h-12 w-12 text-gray-300" />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-600">Año {selectedYearForAnnual} sin datos</p>
                            <p className="text-sm text-gray-400">No hay objetivos registrados para este período</p>
                          </div>
                          <Button
                            onClick={handleAddNew}
                            size="sm"
                            className="mt-2 bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar Objetivos Anuales
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : objetivos.map((objetivo) => (
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
            {generateAvailableYearsForNewVariable().length === 0 ? (
              /* Mensaje cuando no hay años disponibles */
              <div className="flex flex-col items-center justify-center gap-3 py-8 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-12 w-12 text-orange-500" />
                <div className="text-center space-y-1">
                  <p className="text-base font-semibold text-orange-700">No hay años disponibles</p>
                  <p className="text-sm text-orange-600">Todos los años ya tienen objetivos registrados</p>
                  <p className="text-xs text-gray-500 mt-2">Los años con datos: {yearsWithData.join(', ')}</p>
                </div>
              </div>
            ) : (
              <>
                {/* Selectores en línea */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de año */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Año</Label>
                    <Select value={selectedYearForNewVariable} onValueChange={setSelectedYearForNewVariable}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona un año disponible..." />
                      </SelectTrigger>
                      <SelectContent>
                        {generateAvailableYearsForNewVariable().map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{year}</span>
                              <span className="text-xs text-green-600">(Disponible)</span>
                            </div>
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

                {validationError && (
                  <div className="flex items-center gap-1 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    {validationError}
                  </div>
                )}

                {/* Valores mensuales - Grid simple */}
                <div className="space-y-3">
              <div className="space-y-2">
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
                {newVariableName && getVariableInstructions(newVariableName) && (
                  <div className="flex items-start gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <strong>{newVariableName}:</strong> {getVariableInstructions(newVariableName)?.descripcion}
                    </div>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto border rounded-lg p-3">
                {generateMonths().map((mes) => {
                  const valorActual = newVariableValues[mes]?.valor || ""
                  const esValorValido = isValidNumber(valorActual)
                  
                  return (
                  <div key={mes} className="space-y-2 p-3 border rounded-lg bg-gray-50">
                    <div className="text-sm font-medium text-gray-700">{mes}</div>
                    <div className="relative">
                      <Input
                        value={valorActual}
                        onChange={(e) => updateVariableValue(mes, 'valor', e.target.value)}
                        placeholder="0.00"
                        className={`text-sm ${
                          valorActual && !esValorValido 
                            ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                            : ''
                        }`}
                        title={valorActual && !esValorValido ? 'Formato numérico inválido' : ''}
                      />
                      {valorActual && !esValorValido && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <Input
                      value={newVariableValues[mes]?.observaciones || ""}
                      onChange={(e) => updateVariableValue(mes, 'observaciones', e.target.value)}
                      placeholder="Observaciones"
                      className="text-sm"
                    />
                  </div>
                  )
                })}
              </div>
                </div>
              </>
            )}
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
              disabled={isAddingVariable || !isFormValid() || generateAvailableYearsForNewVariable().length === 0}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isAddingVariable ? "Guardando..." : generateAvailableYearsForNewVariable().length === 0 ? "No hay años disponibles" : "Guardar Variable"}
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
