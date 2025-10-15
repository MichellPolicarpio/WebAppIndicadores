"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Target, Pencil, Check, X, History, Trash2, AlertCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface Objetivo {
  id: string
  nombre: string
  valorActual: string
  valorObjetivo: string
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

  const [currentDate] = useState(getCurrentDate())
  const [availableMonths] = useState(generateAvailableMonths())
  const [years] = useState(generateYears())

  const [objetivos, setObjetivos] = useState<Objetivo[]>([
    {
      id: "1",
      nombre: "Reducción de fugas",
      valorActual: "15%",
      valorObjetivo: "10%",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 50,
    },
    {
      id: "2",
      nombre: "Satisfacción del cliente",
      valorActual: "85%",
      valorObjetivo: "95%",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 75,
    },
    {
      id: "3",
      nombre: "Cobertura de servicio",
      valorActual: "92%",
      valorObjetivo: "98%",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 67,
    },
    {
      id: "4",
      nombre: "Eficiencia operativa",
      valorActual: "78%",
      valorObjetivo: "90%",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
      progreso: 60,
    },
  ])

  const [selectedMonth, setSelectedMonth] = useState(getMonthName(currentDate.month))
  const [selectedYear, setSelectedYear] = useState(currentDate.year.toString())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ actual: "", objetivo: "" })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string>("")

  const handleEdit = (objetivo: Objetivo) => {
    setEditingId(objetivo.id)
    setEditValues({ actual: objetivo.valorActual, objetivo: objetivo.valorObjetivo })
  }

  const handleSaveEdit = (id: string) => {
    if (!editValues.actual.trim() || !editValues.objetivo.trim()) {
      setValidationError("Los valores no pueden estar vacíos")
      return
    }

    setObjetivos(
      objetivos.map((o) =>
        o.id === id
          ? {
              ...o,
              valorActual: editValues.actual,
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

  const handleAddNew = () => {
    const nextMonth = currentDate.month + 1
    const nextYear = nextMonth > 11 ? currentDate.year + 1 : currentDate.year
    const nextMonthName = getMonthName(nextMonth > 11 ? 0 : nextMonth)

    const newObjetivo: Objetivo = {
      id: Date.now().toString(),
      nombre: "Nuevo objetivo",
      valorActual: "0%",
      valorObjetivo: "100%",
      periodo: `${nextMonthName} ${nextYear}`,
      progreso: 0,
    }
    setObjetivos([...objetivos, newObjetivo])
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
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:w-auto">
              <div className="flex gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger className="w-20 sm:w-24 bg-slate-800 border-slate-700 text-white text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {availableMonths.map((month) => (
                      <SelectItem key={month.value} value={month.value} className="text-white focus:bg-slate-700 text-xs sm:text-sm">
                        {month.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-20 sm:w-24 bg-slate-800 border-slate-700 text-white text-xs sm:text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white focus:bg-slate-700 text-xs sm:text-sm">
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Objetivo</th>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Valor Actual</th>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Valor Objetivo</th>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Progreso</th>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700 hidden sm:table-cell">Periodo</th>
                  <th className="text-left px-3 sm:px-6 py-3 text-xs sm:text-sm font-semibold text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {objetivos.map((objetivo) => (
                  <tr key={objetivo.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900 max-w-[150px] truncate" title={objetivo.nombre}>
                      {objetivo.nombre}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                      {editingId === objetivo.id ? (
                        <div className="space-y-1">
                          <Input
                            value={editValues.actual}
                            onChange={(e) => setEditValues({ ...editValues, actual: e.target.value })}
                            className="w-20 sm:w-24 bg-white border-gray-300 text-gray-900 text-xs sm:text-sm"
                          />
                          {validationError && editingId === objetivo.id && (
                            <div className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="h-3 w-3" />
                              {validationError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-900 font-medium">{objetivo.valorActual}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm">
                      {editingId === objetivo.id ? (
                        <Input
                          value={editValues.objetivo}
                          onChange={(e) => setEditValues({ ...editValues, objetivo: e.target.value })}
                          className="w-20 sm:w-24 bg-white border-gray-300 text-gray-900 text-xs sm:text-sm"
                        />
                      ) : (
                        <span className="text-blue-600 font-medium">{objetivo.valorObjetivo}</span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[80px] sm:max-w-[100px]">
                          <div
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${objetivo.progreso}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 sm:w-10">{objetivo.progreso}%</span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-slate-400 hidden sm:table-cell">{objetivo.periodo}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2">
                        {editingId === objetivo.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(objetivo.id)}
                              className="bg-green-600 hover:bg-green-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                              title="Guardar"
                            >
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="text-slate-400 hover:text-white hover:bg-slate-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                              title="Cancelar"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleEdit(objetivo)}
                              className="bg-amber-600 hover:bg-amber-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                              title="Editar"
                            >
                              <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewHistory(objetivo.id)}
                              className="bg-purple-600 hover:bg-purple-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                              title="Ver Histórico"
                            >
                              <History className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteClick(objetivo.id)}
                              className="bg-red-600 hover:bg-red-700 h-6 w-6 sm:h-8 sm:w-8 p-0"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center sm:justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/indicadores")}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white w-full sm:w-auto"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Regresar
        </Button>
      </div>

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
