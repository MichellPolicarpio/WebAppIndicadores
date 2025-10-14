"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Pencil, Check, X, History, Trash2, AlertCircle } from "lucide-react"
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

interface Variable {
  id: string
  nombre: string
  valor: string
  periodo: string
}

export default function AgregarVariablePage() {
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

  const [variables, setVariables] = useState<Variable[]>([
    {
      id: "1",
      nombre: "Número de acometidas",
      valor: "12,345",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "2",
      nombre: "Número de clientes",
      valor: "10,152",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "3",
      nombre: "Clientes domésticos",
      valor: "8,205",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "4",
      nombre: "Número de clientes con servicio medido",
      valor: "44,501",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "5",
      nombre: "Número de clientes con servicio de cuota fija",
      valor: "16,210",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "6",
      nombre: "Número de clientes servicio suspendido",
      valor: "4,501",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
    {
      id: "7",
      nombre: "Facturación total con IVA (mxp)",
      valor: "123,456",
      periodo: `${getMonthName(currentDate.month)} ${currentDate.year}`,
    },
  ])

  const [selectedMonth, setSelectedMonth] = useState(getMonthName(currentDate.month))
  const [selectedYear, setSelectedYear] = useState(currentDate.year.toString())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [validationError, setValidationError] = useState<string>("")

  const handleEdit = (variable: Variable) => {
    setEditingId(variable.id)
    setEditValue(variable.valor)
  }

  const handleSaveEdit = (id: string) => {
    if (!editValue.trim()) {
      setValidationError("El valor no puede estar vacío")
      return
    }

    if (isNaN(Number(editValue.replace(/,/g, "")))) {
      setValidationError("El valor debe ser un número válido")
      return
    }

    setVariables(variables.map((v) => (v.id === id ? { ...v, valor: editValue } : v)))
    setEditingId(null)
    setValidationError("")
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditValue("")
    setValidationError("")
  }

  const handleAddNew = () => {
    const nextMonth = currentDate.month + 1
    const nextYear = nextMonth > 11 ? currentDate.year + 1 : currentDate.year
    const nextMonthName = getMonthName(nextMonth > 11 ? 0 : nextMonth)

    const newVariable: Variable = {
      id: Date.now().toString(),
      nombre: "Nueva variable",
      valor: "0",
      periodo: `${nextMonthName} ${nextYear}`,
    }
    setVariables([...variables, newVariable])
  }

  const handleDeleteClick = (id: string) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setVariables(variables.filter((v) => v.id !== itemToDelete))
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleViewHistory = (id: string) => {
    // TODO: Implement history view functionality
    console.log("Ver histórico de variable:", id)
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard")}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Valores Guardados</h1>
          <p className="text-gray-600 mt-1">Gestiona las variables del sistema</p>
        </div>
      </div>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader className="border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Variables guardadas: {variables.length}/25</CardTitle>
              <CardDescription className="text-slate-400">
                Administra los valores de las variables por periodo
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {availableMonths.map((month) => (
                    <SelectItem key={month.value} value={month.value} className="text-white focus:bg-slate-700">
                      {month.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-24 bg-slate-800 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()} className="text-white focus:bg-slate-700">
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Agregar Variable
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800 border-b border-slate-700">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-300">Variable</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-300">Valor</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-300">Periodo</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-slate-300">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {variables.map((variable) => (
                  <tr key={variable.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-white">{variable.nombre}</td>
                    <td className="px-6 py-4 text-sm">
                      {editingId === variable.id ? (
                        <div className="space-y-1">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="w-32 bg-slate-800 border-slate-700 text-white"
                            autoFocus
                          />
                          {validationError && editingId === variable.id && (
                            <div className="flex items-center gap-1 text-xs text-red-400">
                              <AlertCircle className="h-3 w-3" />
                              {validationError}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-white font-medium">{variable.valor}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{variable.periodo}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === variable.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(variable.id)}
                              className="bg-green-600 hover:bg-green-700 h-8 px-3"
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="text-slate-400 hover:text-white hover:bg-slate-700 h-8 px-3"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleEdit(variable)}
                              className="bg-amber-600 hover:bg-amber-700 h-8 px-3"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleViewHistory(variable.id)}
                              className="bg-purple-600 hover:bg-purple-700 h-8 px-3"
                              title="Ver Histórico"
                            >
                              <History className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteClick(variable.id)}
                              className="bg-red-600 hover:bg-red-700 h-8 px-3"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
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

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
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
              Esta acción no se puede deshacer. La variable será eliminada permanentemente del sistema.
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
