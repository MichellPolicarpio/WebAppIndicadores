"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, History, Trash2 } from "lucide-react"
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

export default function VariablesPage() {
  const router = useRouter()
  const [variables, setVariables] = useState<VariableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        setError("")
        const res = await fetch(`/api/variables`, { cache: 'no-store' })
        const json = await res.json()
        if (!json.success) throw new Error(json.message || 'Error')
        setVariables(json.data || [])
      } catch (e: any) {
        setError(e.message || 'Error cargando variables')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatPeriodo = (periodo: string) => {
    const d = new Date(periodo)
    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    return `${meses[d.getMonth()]} ${d.getFullYear()}`
  }

  const handleDeleteClick = (id: number) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      setVariables(variables.filter((v) => v.id_Variable_EmpresaGerencia_Hechos !== itemToDelete))
      // TODO: Aquí deberías hacer un DELETE a la API
    }
    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const handleViewHistory = (idVariableEmpresaGerencia: number) => {
    // TODO: Abrir modal o navegar a página de histórico
    console.log("Ver histórico de variable:", idVariableEmpresaGerencia)
  }

  const handleEdit = (row: VariableRow) => {
    // TODO: Abrir modal de edición
    console.log("Editar variable:", row)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/dashboard/indicadores")}
          className="text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Variables del Último Periodo</h1>
          <p className="text-gray-600 mt-1">Valores más recientes registrados por variable</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Cargando variables...</div>
      ) : (
        <Card className="border-gray-200 bg-white">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-gray-900">Variables: {variables.length}</CardTitle>
            <CardDescription className="text-gray-600">
              Último periodo registrado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Variable</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Valor</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Periodo</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {variables.map((row) => (
                    <tr key={row.id_Variable_EmpresaGerencia_Hechos} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900">{row.nombreVariable}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.valor}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatPeriodo(row.periodo)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(row)}
                            className="bg-amber-600 hover:bg-amber-700 h-8 px-3"
                            title="Editar"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleViewHistory(row.id_Variable_Empresa_Gerencia)}
                            className="bg-purple-600 hover:bg-purple-700 h-8 px-3"
                            title="Ver Histórico"
                          >
                            <History className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteClick(row.id_Variable_EmpresaGerencia_Hechos)}
                            className="bg-red-600 hover:bg-red-700 h-8 px-3"
                            title="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
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

      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push("/dashboard/indicadores")}
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
