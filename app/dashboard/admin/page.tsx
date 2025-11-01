"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Shield, AlertCircle, Plus, Edit, Trash2, Search, Loader2, Save } from "lucide-react"
import { getUser, type User } from "@/lib/auth"
import { toast } from "sonner"

interface Empresa {
  idEmpresaOperadora: number
  nombreEmpresaOperadora: string
  claveEmpresaOperadora: string
}

interface Gerencia {
  id_Empresa_Gerencia: number
  nomGerencia: string
  nombreEmpresaOperadora: string
  claveEmpresaOperadora: string
}

interface UsuarioAdmin {
  id: number
  usuario: string
  correo: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  nombreCompleto: string
  estatusUsuario: number
  esActivo: boolean
  rolUsuario: number | null
  nombreRol: string
  empresaOperadora: number | null
  nombreEmpresa: string
  gerencia: string
  fechaCreacion: string | null
}

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([])
  const [loadingUsuarios, setLoadingUsuarios] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRol, setFilterRol] = useState<string>("all")
  const [filterEstado, setFilterEstado] = useState<string>("all")
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [usuarioEditando, setUsuarioEditando] = useState<UsuarioAdmin | null>(null)
  const [editFormData, setEditFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    rolUsuario: "",
    estatusUsuario: "",
  })
  const [saving, setSaving] = useState(false)
  
  // Estados para crear nuevo usuario
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    usuario: "",
    contraseña: "",
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    rolUsuario: "",
    estatusUsuario: "1",
    empresaId: "",
    gerenciaId: "",
  })
  const [creating, setCreating] = useState(false)
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [gerencias, setGerencias] = useState<Gerencia[]>([])
  const [loadingEmpresas, setLoadingEmpresas] = useState(false)
  const [loadingGerencias, setLoadingGerencias] = useState(false)

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
      return
    }

    // Verificar si es admin (rolUsuario === 1)
    if (currentUser.rolUsuario !== 1) {
      toast.error("No tienes permisos para acceder a esta sección")
      router.push("/dashboard")
      return
    }

    setUser(currentUser)
    setLoading(false)
    fetchUsuarios()
    fetchEmpresas()
  }, [router])

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true)
    try {
      const response = await fetch('/api/admin/users', {
        credentials: 'include'
      })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al cargar usuarios')
      }
      
      setUsuarios(result.usuarios || [])
    } catch (error: any) {
      console.error('Error cargando usuarios:', error)
      toast.error(error.message || 'Error al cargar usuarios')
    } finally {
      setLoadingUsuarios(false)
    }
  }

  const fetchEmpresas = async () => {
    setLoadingEmpresas(true)
    try {
      console.log('🔄 [Admin] Cargando empresas...')
      const response = await fetch('/api/admin/empresas', {
        credentials: 'include'
      })
      const result = await response.json()
      
      console.log('📊 [Admin] Respuesta empresas:', { ok: response.ok, success: result.success, count: result.empresas?.length })
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al cargar empresas')
      }
      
      const empresasData = result.empresas || []
      console.log('✅ [Admin] Empresas cargadas:', empresasData.length)
      setEmpresas(empresasData)
    } catch (error: any) {
      console.error('❌ Error cargando empresas:', error)
      toast.error(error.message || 'Error al cargar empresas')
    } finally {
      setLoadingEmpresas(false)
    }
  }

  const fetchGerencias = async (empresaId: string) => {
    if (!empresaId) {
      setGerencias([])
      return
    }
    
    setLoadingGerencias(true)
    try {
      const response = await fetch(`/api/admin/gerencias?empresaId=${empresaId}`, {
        credentials: 'include'
      })
      const result = await response.json()
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al cargar gerencias')
      }
      
      setGerencias(result.gerencias || [])
    } catch (error: any) {
      console.error('Error cargando gerencias:', error)
      toast.error(error.message || 'Error al cargar gerencias')
    } finally {
      setLoadingGerencias(false)
    }
  }

  // Filtrar usuarios según búsqueda y filtros
  const usuariosFiltrados = usuarios.filter(u => {
    const matchSearch = searchTerm === "" || 
      u.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchRol = filterRol === "all" || 
      (filterRol === "admin" && u.rolUsuario === 1) ||
      (filterRol === "other" && u.rolUsuario !== 1)
    
    const matchEstado = filterEstado === "all" ||
      (filterEstado === "active" && u.esActivo) ||
      (filterEstado === "inactive" && !u.esActivo)
    
    return matchSearch && matchRol && matchEstado
  })

  const handleEditClick = (usuario: UsuarioAdmin) => {
    setUsuarioEditando(usuario)
    setEditFormData({
      nombres: usuario.nombres || "",
      apellidoPaterno: usuario.apellidoPaterno || "",
      apellidoMaterno: usuario.apellidoMaterno || "",
      correo: usuario.correo || "",
      rolUsuario: usuario.rolUsuario?.toString() || "",
      estatusUsuario: usuario.estatusUsuario.toString(),
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!usuarioEditando) return

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/users/${usuarioEditando.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al actualizar usuario')
      }

      toast.success('Usuario actualizado correctamente')
      setEditDialogOpen(false)
      fetchUsuarios() // Recargar lista
    } catch (error: any) {
      console.error('Error actualizando usuario:', error)
      toast.error(error.message || 'Error al actualizar usuario')
    } finally {
      setSaving(false)
    }
  }

  const handleCreateClick = () => {
    setCreateFormData({
      usuario: "",
      contraseña: "",
      nombres: "",
      apellidoPaterno: "",
      apellidoMaterno: "",
      correo: "",
      rolUsuario: "",
      estatusUsuario: "1",
      empresaId: "",
      gerenciaId: "",
    })
    setGerencias([])
    // Asegurar que las empresas se carguen si no están disponibles
    if (empresas.length === 0) {
      console.log('🔄 [Admin] No hay empresas cargadas, recargando...')
      fetchEmpresas()
    } else {
      console.log('✅ [Admin] Empresas ya cargadas:', empresas.length)
    }
    setCreateDialogOpen(true)
  }

  const handleEmpresaChange = (empresaId: string) => {
    setCreateFormData({ ...createFormData, empresaId, gerenciaId: "" })
    fetchGerencias(empresaId)
  }

  const handleCreateUser = async () => {
    // Validaciones
    if (!createFormData.usuario || !createFormData.contraseña || !createFormData.rolUsuario) {
      toast.error('Usuario, contraseña y rol son campos requeridos')
      return
    }

    // Si no es admin, empresa/gerencia es requerida
    if (createFormData.rolUsuario !== "1" && !createFormData.gerenciaId) {
      toast.error('La empresa/gerencia es requerida para usuarios no administradores')
      return
    }

    setCreating(true)
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          usuario: createFormData.usuario,
          contraseña: createFormData.contraseña,
          nombres: createFormData.nombres || null,
          apellidoPaterno: createFormData.apellidoPaterno || null,
          apellidoMaterno: createFormData.apellidoMaterno || null,
          correo: createFormData.correo || null,
          rolUsuario: createFormData.rolUsuario,
          estatusUsuario: createFormData.estatusUsuario,
          idEmpresa_Gerencia: createFormData.gerenciaId || null
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Error al crear usuario')
      }

      toast.success('Usuario creado correctamente')
      setCreateDialogOpen(false)
      fetchUsuarios() // Recargar lista
    } catch (error: any) {
      console.error('Error creando usuario:', error)
      toast.error(error.message || 'Error al crear usuario')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || user.rolUsuario !== 1) {
    return null
  }

  return (
    <div className="space-y-6 w-full mx-auto px-4 lg:px-6 max-w-7xl">
      {/* Sección de Gestión de Usuarios */}
      <Card className="border-gray-200 bg-white shadow-md">
        <CardHeader className="border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl text-gray-900">Gestión de Usuarios</CardTitle>
                <CardDescription className="text-sm text-gray-600 mt-1">
                  Ver, crear, editar y eliminar usuarios del sistema
                </CardDescription>
              </div>
            </div>
            <Button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Usuario
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          {/* Barra de búsqueda y filtros */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuario, nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterRol}
                onChange={(e) => setFilterRol(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="other">Otros roles</option>
              </select>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Total Usuarios</p>
              <p className="text-2xl font-bold text-blue-900">{usuarios.length}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-600 font-medium">Activos</p>
              <p className="text-2xl font-bold text-green-900">
                {usuarios.filter(u => u.esActivo).length}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 font-medium">Inactivos</p>
              <p className="text-2xl font-bold text-gray-900">
                {usuarios.filter(u => !u.esActivo).length}
              </p>
            </div>
          </div>

          {/* Tabla de usuarios */}
          {loadingUsuarios ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : usuariosFiltrados.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No se encontraron usuarios</p>
              <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white">
              <div className="overflow-x-auto relative">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm">Usuario</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm">Nombre</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm hidden md:table-cell">Correo</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm">Rol</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm hidden lg:table-cell">Empresa</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm hidden lg:table-cell">Gerencia</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm">Estado</TableHead>
                      <TableHead className="font-semibold text-gray-700 py-2.5 px-3 text-sm text-right sticky right-0 bg-gradient-to-r from-gray-50 to-gray-100 z-10 border-l border-gray-200">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map((usuario, index) => {
                      const isEven = index % 2 === 0
                      return (
                      <TableRow 
                        key={usuario.id} 
                        className={`
                          border-b border-gray-100 transition-colors duration-150
                          ${isEven ? 'bg-white' : 'bg-gray-50/50'}
                          hover:bg-blue-50/50
                        `}
                      >
                        <TableCell className="py-2.5 px-3">
                          <div className="font-semibold text-gray-900 text-sm">{usuario.usuario}</div>
                          <div className="text-gray-500 text-xs md:hidden mt-0.5">{usuario.correo || 'Sin correo'}</div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <div className="text-gray-700 text-sm truncate max-w-[150px]">{usuario.nombreCompleto}</div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden md:table-cell">
                          <div className="text-gray-600 text-xs truncate max-w-[200px]" title={usuario.correo}>
                            {usuario.correo || <span className="text-gray-400 italic">Sin correo</span>}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <Badge 
                            variant={usuario.rolUsuario === 1 ? "default" : "secondary"}
                            className={`
                              ${usuario.rolUsuario === 1 
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm" 
                                : "bg-gray-200 text-gray-700"
                              }
                              px-2 py-0.5 text-xs font-medium
                            `}
                          >
                            {usuario.nombreRol}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden lg:table-cell">
                          <div className="text-gray-700 text-xs truncate max-w-[120px]" title={usuario.nombreEmpresa}>
                            {usuario.nombreEmpresa}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3 hidden lg:table-cell">
                          <div className="text-gray-600 text-xs truncate max-w-[120px]" title={usuario.gerencia}>
                            {usuario.gerencia}
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-3">
                          <Badge 
                            variant={usuario.esActivo ? "default" : "secondary"}
                            className={`
                              ${usuario.esActivo 
                                ? "bg-green-100 text-green-700 border border-green-200" 
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                              }
                              px-2 py-0.5 text-xs font-medium
                            `}
                          >
                            {usuario.esActivo ? "✓" : "✗"}
                          </Badge>
                        </TableCell>
                        <TableCell 
                          className={`py-2.5 px-3 sticky right-0 z-10 border-l border-gray-200 ${
                            isEven ? 'bg-white' : 'bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-end gap-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors"
                              title="Editar usuario"
                              onClick={() => handleEditClick(usuario)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Información de resultados filtrados */}
          {usuariosFiltrados.length > 0 && (
            <div className="mt-4 text-sm text-gray-600 text-center">
              Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Crear Usuario */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Crear Nuevo Usuario
            </DialogTitle>
            <DialogDescription>
              Completa el formulario para agregar un nuevo usuario al sistema
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Usuario y Contraseña */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="usuario-create">Usuario *</Label>
                <Input
                  id="usuario-create"
                  value={createFormData.usuario}
                  onChange={(e) => setCreateFormData({ ...createFormData, usuario: e.target.value })}
                  placeholder="Nombre de usuario"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contraseña-create">Contraseña *</Label>
                <Input
                  id="contraseña-create"
                  type="password"
                  value={createFormData.contraseña}
                  onChange={(e) => setCreateFormData({ ...createFormData, contraseña: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Nombres */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres-create">Nombre(s)</Label>
                <Input
                  id="nombres-create"
                  value={createFormData.nombres}
                  onChange={(e) => setCreateFormData({ ...createFormData, nombres: e.target.value })}
                  placeholder="Nombre(s)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno-create">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno-create"
                  value={createFormData.apellidoPaterno}
                  onChange={(e) => setCreateFormData({ ...createFormData, apellidoPaterno: e.target.value })}
                  placeholder="Apellido Paterno"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno-create">Apellido Materno</Label>
              <Input
                id="apellidoMaterno-create"
                value={createFormData.apellidoMaterno}
                onChange={(e) => setCreateFormData({ ...createFormData, apellidoMaterno: e.target.value })}
                placeholder="Apellido Materno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo-create">Correo Electrónico</Label>
              <Input
                id="correo-create"
                type="email"
                value={createFormData.correo}
                onChange={(e) => setCreateFormData({ ...createFormData, correo: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Rol y Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rol-create">Rol *</Label>
                <Select
                  value={createFormData.rolUsuario}
                  onValueChange={(value) => {
                    setCreateFormData({ ...createFormData, rolUsuario: value })
                    // Si es admin, limpiar empresa/gerencia
                    if (value === "1") {
                      setCreateFormData(prev => ({ ...prev, empresaId: "", gerenciaId: "" }))
                      setGerencias([])
                    }
                  }}
                >
                  <SelectTrigger id="rol-create">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Creador</SelectItem>
                    <SelectItem value="3">Consultas</SelectItem>
                    <SelectItem value="4">Desinfección</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado-create">Estado</Label>
                <Select
                  value={createFormData.estatusUsuario}
                  onValueChange={(value) => setCreateFormData({ ...createFormData, estatusUsuario: value })}
                >
                  <SelectTrigger id="estado-create">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Empresa y Gerencia (solo si no es admin) */}
            {createFormData.rolUsuario !== "1" && (
              <div className="space-y-4 pt-2 border-t border-gray-200">
                <div className="space-y-2">
                  <Label htmlFor="empresa-create">Empresa *</Label>
                  {empresas.length === 0 && !loadingEmpresas && (
                    <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-md px-3 py-2 mb-2">
                      No hay empresas disponibles. Intenta recargar la página.
                    </div>
                  )}
                  <Select
                    value={createFormData.empresaId}
                    onValueChange={handleEmpresaChange}
                    disabled={loadingEmpresas || empresas.length === 0}
                  >
                    <SelectTrigger id="empresa-create">
                      <SelectValue placeholder={loadingEmpresas ? "Cargando..." : empresas.length === 0 ? "No hay empresas" : "Seleccionar empresa"} />
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

                <div className="space-y-2">
                  <Label htmlFor="gerencia-create">Gerencia *</Label>
                  <Select
                    value={createFormData.gerenciaId}
                    onValueChange={(value) => setCreateFormData({ ...createFormData, gerenciaId: value })}
                    disabled={!createFormData.empresaId || loadingGerencias}
                  >
                    <SelectTrigger id="gerencia-create">
                      <SelectValue
                        placeholder={
                          !createFormData.empresaId
                            ? "Selecciona empresa primero"
                            : loadingGerencias
                            ? "Cargando..."
                            : "Seleccionar gerencia"
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
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={creating}
              className="bg-green-600 hover:bg-green-700"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Usuario
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Editar Usuario */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Editar Usuario
            </DialogTitle>
            <DialogDescription>
              Modifica la información del usuario {usuarioEditando?.usuario}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="usuario-edit">Usuario</Label>
              <Input
                id="usuario-edit"
                value={usuarioEditando?.usuario || ""}
                disabled
                className="bg-gray-100 text-gray-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombres-edit">Nombre(s)</Label>
                <Input
                  id="nombres-edit"
                  value={editFormData.nombres}
                  onChange={(e) => setEditFormData({ ...editFormData, nombres: e.target.value })}
                  placeholder="Nombre(s)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apellidoPaterno-edit">Apellido Paterno</Label>
                <Input
                  id="apellidoPaterno-edit"
                  value={editFormData.apellidoPaterno}
                  onChange={(e) => setEditFormData({ ...editFormData, apellidoPaterno: e.target.value })}
                  placeholder="Apellido Paterno"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="apellidoMaterno-edit">Apellido Materno</Label>
              <Input
                id="apellidoMaterno-edit"
                value={editFormData.apellidoMaterno}
                onChange={(e) => setEditFormData({ ...editFormData, apellidoMaterno: e.target.value })}
                placeholder="Apellido Materno"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="correo-edit">Correo Electrónico</Label>
              <Input
                id="correo-edit"
                type="email"
                value={editFormData.correo}
                onChange={(e) => setEditFormData({ ...editFormData, correo: e.target.value })}
                placeholder="correo@ejemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rol-edit">Rol</Label>
                <Select
                  value={editFormData.rolUsuario}
                  onValueChange={(value) => setEditFormData({ ...editFormData, rolUsuario: value })}
                >
                  <SelectTrigger id="rol-edit">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Administrador</SelectItem>
                    <SelectItem value="2">Creador</SelectItem>
                    <SelectItem value="3">Consultas</SelectItem>
                    <SelectItem value="4">Desinfección</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado-edit">Estado</Label>
                <Select
                  value={editFormData.estatusUsuario}
                  onValueChange={(value) => setEditFormData({ ...editFormData, estatusUsuario: value })}
                >
                  <SelectTrigger id="estado-edit">
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Activo</SelectItem>
                    <SelectItem value="0">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Otras secciones de admin (expandibles) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Configuración del Sistema</CardTitle>
            <CardDescription>Gestión de parámetros generales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 text-sm">
              Próximamente disponible
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Auditoría y Logs</CardTitle>
            <CardDescription>Registros de actividad del sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500 text-sm">
              Próximamente disponible
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

