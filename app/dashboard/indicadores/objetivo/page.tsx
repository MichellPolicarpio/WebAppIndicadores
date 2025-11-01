"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Target, Pencil, Check, X, History, Trash2, AlertCircle, Calendar, BarChart3, Edit3, ChevronLeft, ChevronRight, Building2 } from "lucide-react"
import { getUser, type User } from "@/lib/auth"
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
import { toast } from "sonner"

interface Objetivo {
  id: string
  nombre: string
  valorObjetivo: string
  valoresMensuales: { [mes: string]: string }  // Objetivos por mes
  valoresReales?: { [mes: string]: string }     // Valores reales por mes
  periodo: string
  progreso: number
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

export default function AgregarObjetivoPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  
  // Estado para filtros de admin (empresa y gerencia)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [gerencias, setGerencias] = useState<Gerencia[]>([])
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>("")
  const [selectedGerencia, setSelectedGerencia] = useState<string>("")
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [loadingGerencias, setLoadingGerencias] = useState(false)

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
  // Variables ya registradas para el año seleccionado en el modal
  const [existingVariablesForYear, setExistingVariablesForYear] = useState<Set<string>>(new Set())
  const [loadingExistingForYear, setLoadingExistingForYear] = useState(false)

  // Cargar variables existentes para el año seleccionado en el modal (sin afectar la tabla principal)
  const fetchExistingVariablesForYear = useCallback(async (yearStr: string) => {
    try {
      setLoadingExistingForYear(true)
      const response = await fetch(`/api/objetivos?year=${parseInt(yearStr, 10)}`)
      const result = await response.json()
      if (result.success) {
        const names = new Set<string>((result.data || []).map((v: any) => v.nombre))
        setExistingVariablesForYear(names)
      } else {
        setExistingVariablesForYear(new Set())
      }
    } catch (e) {
      setExistingVariablesForYear(new Set())
    } finally {
      setLoadingExistingForYear(false)
    }
  }, [])

  // Cuando se abre el modal o cambia el año del modal, cargar existentes
  useEffect(() => {
    if (addVariableDialogOpen && selectedYearForNewVariable) {
      fetchExistingVariablesForYear(selectedYearForNewVariable)
    }
  }, [addVariableDialogOpen, selectedYearForNewVariable, fetchExistingVariablesForYear])
  
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

  // Detectar si es admin al cargar
  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setUser(currentUser)
      const userIsAdmin = currentUser.rolUsuario === 1
      setIsAdmin(userIsAdmin)
      
      if (userIsAdmin && currentUser.id) {
        fetchEmpresas()
      }
    }
  }, [])

  // Cargar empresas (solo admin)
  const fetchEmpresas = async () => {
    const currentUser = getUser()
    if (!currentUser || currentUser.rolUsuario !== 1) {
      return
    }
    
    setLoadingEmpresas(true)
    try {
      const response = await fetch('/api/admin/empresas', {
        credentials: 'include'
      })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        console.error('Error cargando empresas:', result.message)
        toast.error(result.message || 'Error al cargar empresas')
        return
      }
      
      if (result.empresas) {
        setEmpresas(result.empresas)
      }
    } catch (error: any) {
      console.error('Error cargando empresas:', error)
      toast.error('Error al cargar empresas')
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

  const fetchObjetivos = useCallback(async (yearOverride?: number | string) => {
    // No ejecutar si el usuario no está cargado
    if (!user) {
      return
    }
    
    // No ejecutar si es admin sin gerencia seleccionada
    if (isAdmin && !selectedGerencia) {
      setObjetivos([])
      setYearsWithData([])
      setLoadingObjetivos(false)
      return
    }

      setLoadingObjetivos(true)
      try {
        const yearToFetch = viewType === 'anual' ? selectedYearForAnnual : parseInt(selectedYear)
      const finalYear = yearOverride ?? yearToFetch
      
      let response: Response
      if (isAdmin && selectedGerencia) {
        response = await fetch(`/api/admin/objetivos?empresaGerencia=${selectedGerencia}&year=${finalYear}`, {
          credentials: 'include'
        })
      } else if (!isAdmin) {
        response = await fetch(`/api/objetivos?year=${finalYear}`, {
          credentials: 'include'
        })
      } else {
        setObjetivos([])
        setYearsWithData([])
        setLoadingObjetivos(false)
        return
      }
      
        const result = await response.json()
        if (result.success) {
          setObjetivos(result.data || [])
        if (result.years && result.years.length > 0) setYearsWithData(result.years)
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
  }, [selectedYear, selectedYearForAnnual, viewType, isAdmin, selectedGerencia, user])

  // Reemplazar el useEffect anterior por uno que use fetchObjetivos directamente
  useEffect(() => {
    // No ejecutar si es admin sin gerencia seleccionada
    if (isAdmin && !selectedGerencia) {
      return
    }
    fetchObjetivos()
  }, [selectedYearForAnnual, selectedYear, selectedMonth, viewType, isAdmin, selectedGerencia, fetchObjetivos])

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

    // Limpiar comas de los valores antes de guardar
    const valoresMensSinComa: typeof newVariableValues = {}
    Object.keys(newVariableValues).forEach((mes) => {
      valoresMensSinComa[mes] = {
        valor: newVariableValues[mes]?.valor ? newVariableValues[mes].valor.replace(/,/g, '') : '',
        observaciones: newVariableValues[mes]?.observaciones || ''
      }
    })
    
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
          valoresMensuales: valoresMensSinComa
        })
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al guardar objetivos')
      }
      setAddVariableDialogOpen(false)
      setNewVariableName("")
      setNewVariableValues({})
      setSelectedYearForNewVariable(currentDate.year.toString())
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

  // Guardar edición completa (toda la variable, por ejemplo los 12 meses)
  const saveFullEdit = async () => {
    if (!editingVariable) return
    setIsSavingEdit(true)
    try {
      // Construir payload de actualizaciones por cada mes editado
      const updates = Object.entries(editVariableValues).map(([mes, data]) => {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"]
        const mesIndex = months.indexOf(mes)
        const year = selectedYearForAnnual
        const periodo = `${year}-${String(mesIndex+1).padStart(2, '0')}-01`
        // limpiar comas antes de enviar
        const valorLimpio = data.valor ? data.valor.replace(/,/g, '') : ''
        const valorNum = valorLimpio !== '' ? parseFloat(valorLimpio) : null
        return {
          id_Objetivo_Variable: editingVariable.id,
          periodo,
          valorObjetivo: valorNum,
          observaciones_objetivo: data.observaciones||null
        }
      });
      const response = await fetch('/api/objetivos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al guardar objetivos')
      }
      setEditVariableDialogOpen(false)
      setEditingVariable(null)
      setEditVariableValues({})
      await fetchObjetivos(selectedYearForAnnual)
    } catch (error) {
      console.error("Error guardando edición:", error)
      setValidationError(error.message || 'Error al guardar edición')
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
    // Corrige: sólo tomar el .valor de cada mes, no el objeto completo
    setEditingRowId(objetivo.id)
    setRowEditValues(
      Object.fromEntries(
        Object.entries(objetivo.valoresMensuales).map(([mes, data]: any) => [mes, typeof data === 'object' && data !== null ? data.valor : data])
      )
    )
  }

  // Guardar edición de fila específica
  const saveRowEdit = async () => {
    if (!editingRowId) return;
    setIsSavingRow(true);
    try {
      const objetivoOriginal = objetivos.find(obj => obj.id === editingRowId)
      const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
      const year = selectedYearForAnnual;
      const updates = months.map((mes, i) => {
        const nuevoValorRaw = rowEditValues[mes];
        const valorOriginal = objetivoOriginal && objetivoOriginal.valoresMensuales ? objetivoOriginal.valoresMensuales[mes]?.valor : undefined;
        const idObjetivo = objetivoOriginal && objetivoOriginal.valoresMensuales ? objetivoOriginal.valoresMensuales[mes]?.idObjetivo : null;
        // limpiar comas
        const nuevoValor = typeof nuevoValorRaw === 'string' ? nuevoValorRaw.replace(/,/g, '') : nuevoValorRaw;
        if (
          idObjetivo &&
          nuevoValor !== undefined && nuevoValor !== valorOriginal && nuevoValor !== '' && nuevoValor !== "-"
        ) {
          return {
            id_Objetivo_Variable: idObjetivo,
            periodo: `${year}-${String(i + 1).padStart(2, "0")}-01`,
            valorObjetivo: parseFloat(nuevoValor as string),
            observaciones_objetivo: null
          }
        }
        return null;
      }).filter(Boolean);
      if (updates.length === 0) {
        setEditingRowId(null);
        setRowEditValues({});
        setIsSavingRow(false);
        return;
      }
      const response = await fetch('/api/objetivos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al guardar objetivo')
      }
      setEditingRowId(null);
      setRowEditValues({});
      await fetchObjetivos(selectedYearForAnnual);
    } catch(error) {
      console.error("Error guardando edición de fila:", error)
      setValidationError(error.message || 'Error al guardar edición de fila');
    } finally {
      setIsSavingRow(false);
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

  // Eliminar variable anual (todos sus meses para ese año)
  const handleDeleteObjetivo = async (idVariableEmpresaGerencia: string, year: number, nombreVariable: string) => {
    const ok = window.confirm(`¿Eliminar todos los objetivos anuales de "${nombreVariable}" para ${year}?`)
    if (!ok) return
    try {
      const response = await fetch('/api/objetivos', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idVariableEmpresaGerencia, year })
      })
      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "No se pudo eliminar")
      }
      toast.success('Objetivo anual eliminado')
      await fetchObjetivos(selectedYearForAnnual)
    } catch (e: any) {
      toast.error(e.message || "Error eliminando objetivo")
    }
  }

  return (
    <div className="space-y-2 sm:space-y-3 w-full mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl 2xl:max-w-[90vw] 3xl:max-w-[85vw]">
      {/* Header Section */}
      <div className="flex items-start gap-3 sm:gap-4">
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

      {/* Selector de Período y Filtros (Combinados) */}
      {viewType === "anual" && (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2.5">
          {/* Fila 1: Título */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
              <span className="text-xs font-medium text-gray-700">Año:</span>
              </div>
            </div>
            
          {/* Fila 2: Navegación de años */}
          <div className="flex items-center gap-1.5 mb-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('prev')}
                disabled={allYears.indexOf(yearRangeStart) === 0}
              className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-7 w-7 p-0 rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
              <ChevronLeft className="h-3.5 w-3.5" />
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
                      className={`px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 whitespace-nowrap relative ${
                          isSelected
                            ? hasData
                              ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                              : 'bg-gradient-to-r from-gray-500 to-gray-400 text-white shadow-lg opacity-70'
                            : hasData
                              ? 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 shadow-sm'
                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 shadow-sm opacity-60'
                        }`}
                      >
                        {year}
                        {!hasData && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full"></span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateYear('next')}
                disabled={allYears.indexOf(yearRangeStart) + YEARS_PER_PAGE >= allYears.length}
              className="border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 flex-shrink-0 h-7 w-7 p-0 rounded-md shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <Label htmlFor="empresa-filter-objetivo" className="text-xs text-gray-600 whitespace-nowrap">Empresa</Label>
                    <Select
                      value={selectedEmpresa}
                      onValueChange={(value) => {
                        setSelectedEmpresa(value)
                        setSelectedGerencia("")
                      }}
                      disabled={loadingEmpresas}
                    >
                      <SelectTrigger id="empresa-filter-objetivo" className="h-7 text-xs px-2 rounded-md">
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
                    <Label htmlFor="gerencia-filter-objetivo" className="text-xs text-gray-600 whitespace-nowrap">Gerencia</Label>
                    <Select
                      value={selectedGerencia}
                      onValueChange={setSelectedGerencia}
                      disabled={!selectedEmpresa || loadingGerencias}
                    >
                      <SelectTrigger id="gerencia-filter-objetivo" className="h-7 text-xs px-2 rounded-md">
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
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-xs shadow-sm ${
                    yearsWithData.includes(selectedYearForAnnual)
                  ? 'bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-700'
                  : 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 text-orange-700'
                  }`}>
                    <Calendar className={`h-3.5 w-3.5 ${yearsWithData.includes(selectedYearForAnnual) ? 'text-blue-600' : 'text-orange-500'}`} />
                <span className="font-semibold">{selectedYearForAnnual}</span>
                        {!yearsWithData.includes(selectedYearForAnnual) && (
                  <span className="text-[10px]">(Vacío)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
                    <th className="text-center px-3 sm:px-6 xl:px-8 py-3 text-xs sm:text-sm font-semibold text-gray-700 min-w-[150px] xl:min-w-[180px]">Cumplimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isAdmin && !selectedGerencia ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Building2 className="h-16 w-16 text-gray-300" />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-600">Seleccione filtros para mostrar datos</p>
                            <p className="text-sm text-gray-400">Selecciona empresa y gerencia en los filtros de arriba</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : loadingObjetivos ? (
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
                    const rawObjetivo = objetivo.valoresMensuales ? objetivo.valoresMensuales[selectedMonth] : '-'
                    const valorObjetivoMes = typeof rawObjetivo === 'string' ? rawObjetivo : (rawObjetivo?.valor ?? '-')
                    const rawReal = objetivo.valoresReales ? objetivo.valoresReales[selectedMonth] : '-'
                    const valorReal = typeof rawReal === 'string' ? rawReal : (rawReal?.valor ?? '-')
                    
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
                    <th className="text-center px-3 xl:px-6 py-3 text-xs font-semibold text-gray-700 sticky right-0 bg-gray-50 z-10 min-w-[60px] xl:min-w-[100px]">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {isAdmin && !selectedGerencia ? (
                    <tr>
                      <td colSpan={14} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Building2 className="h-16 w-16 text-gray-300" />
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-600">Seleccione filtros para mostrar datos</p>
                            <p className="text-sm text-gray-400">Selecciona empresa y gerencia en los filtros de arriba</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ) : loadingObjetivos ? (
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
                      <td className="px-3 xl:px-6 py-3 text-center text-xs text-gray-900 sticky left-0 bg-white z-10 font-medium max-w-[150px] xl:max-w-[200px]" title={objetivo.nombre}>
                        <div className="whitespace-normal break-words hyphens-auto mx-auto" style={{ lineHeight: '1.2', maxHeight: '2.4em', overflow: 'hidden' }}>
                        {objetivo.nombre}
                        </div>
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
                              <Button
                                size="sm"
                                onClick={() => handleDeleteObjetivo(objetivo.id, selectedYearForAnnual, objetivo.nombre)}
                                variant="outline"
                                className="h-10 w-10 p-0 rounded-xl border-2 border-red-500 text-red-500 hover:bg-red-50 hover:border-red-600 hover:text-red-600 transition-all duration-200"
                                title="Eliminar variable anual"
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
              <>
                {/* Selectores en línea */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Selector de año */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Año</Label>
                  <Select value={selectedYearForNewVariable} onValueChange={(v) => setSelectedYearForNewVariable(v)}>
                      <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un año..." />
                      </SelectTrigger>
                      <SelectContent>
                      {allYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{year}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Selector de variable */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Variable</Label>
                  <Select value={newVariableName} onValueChange={(value) => { selectPreloadedVariable(value) }}>
                  <SelectTrigger className="w-full">
                      <SelectValue placeholder={loadingExistingForYear ? 'Cargando...' : 'Variable...'} />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                      {variablesDisponibles.map((variable, index) => {
                        const yaRegistrada = existingVariablesForYear.has(variable)
                        return (
                          <SelectItem key={index} value={variable} disabled={yaRegistrada}>
                            <div className="flex items-center gap-2">
                              <span className={`font-medium ${yaRegistrada ? 'text-gray-400' : ''}`}>{variable}</span>
                              {yaRegistrada && (
                                <span className="text-xs text-red-500">(Ya registrada para este año)</span>
                              )}
                            </div>
                      </SelectItem>
                        )
                      })}
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
