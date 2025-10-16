"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Pencil, History, Trash2, X } from "lucide-react"
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
  fecha_Modificacion: string | null
  creado_Por: string | null
  modificado_Por: string | null
}

export default function VariablesPage() {
  const router = useRouter()
  const [variables, setVariables] = useState<VariableRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Estado para diálogo de eliminación
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<number | null>(null)
  
  // Estado para modal de edición
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<VariableRow | null>(null)
  const [newValue, setNewValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Estado para modal de histórico
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [historico, setHistorico] = useState<HistoricoRow[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [currentVariableName, setCurrentVariableName] = useState("")

  useEffect(() => {
    fetchVariables()
  }, [])

  const fetchVariables = async () => {
    try {
      setIsLoading(true)
      setError("")
      const res = await fetch(`/api/variables`, { cache: 'no-store' })
      const json = await res.json()
      console.log('Respuesta del API:', json)
      if (!json.success) {
        throw new Error(json.error || json.message || 'Error desconocido')
      }
      setVariables(json.data || [])
    } catch (e: any) {
      console.error('Error en fetchVariables:', e)
      setError(e.message || 'Error cargando variables')
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

  // ==================== ELIMINAR ====================
  const handleDeleteClick = (id: number) => {
    setItemToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return

    try {
      const res = await fetch(`/api/variables/${itemToDelete}`, {
        method: 'DELETE',
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al eliminar')
      }

      toast.success('Variable eliminada exitosamente')
      setVariables(variables.filter((v) => v.id_Variable_EmpresaGerencia_Hechos !== itemToDelete))
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar la variable')
    } finally {
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  // ==================== EDITAR ====================
  const handleEdit = (row: VariableRow) => {
    setItemToEdit(row)
    setNewValue(row.valor.toString())
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
        body: JSON.stringify({ valor: valorNumerico }),
      })
      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al actualizar')
      }

      toast.success('Variable actualizada exitosamente')
      
      // Actualizar la tabla local
      setVariables(variables.map(v => 
        v.id_Variable_EmpresaGerencia_Hechos === itemToEdit.id_Variable_EmpresaGerencia_Hechos
          ? { ...v, valor: valorNumerico }
          : v
      ))

      setEditDialogOpen(false)
      setItemToEdit(null)
      setNewValue("")
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar la variable')
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
    <div className="space-y-6 max-w-6xl mx-auto px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/dashboard/indicadores")}
          className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Indicadores del Último Periodo</h1>
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
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{row.valor.toLocaleString()}</td>
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
                            onClick={() => handleViewHistory(row.id_Variable_Empresa_Gerencia, row.nombreVariable)}
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

      {/* ==================== DIÁLOGO DE ELIMINACIÓN ==================== */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El registro de esta variable será eliminado permanentemente del sistema.
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
        <DialogContent className="sm:max-w-4xl max-h-[80vh]">
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
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Modificado</th>
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
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {row.fecha_Modificacion ? (
                          <>
                            <div>{formatFecha(row.fecha_Modificacion)}</div>
                            {row.modificado_Por && (
                              <div className="text-xs text-gray-400">{row.modificado_Por}</div>
                            )}
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
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
