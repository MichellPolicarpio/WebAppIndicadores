"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Shield, AlertCircle, Plus, Edit, Trash2 } from "lucide-react"
import { getUser, type User } from "@/lib/auth"
import { toast } from "sonner"

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
  }, [router])

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
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl shadow-lg">
          <Shield className="h-8 w-8 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-sm text-gray-600 mt-1">Gestión completa del sistema</p>
        </div>
      </div>

      {/* Sección de Gestión de Usuarios */}
      <Card className="border-gray-200 bg-white shadow-md">
        <CardHeader className="border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle className="text-xl text-gray-900">Gestión de Usuarios</CardTitle>
              <CardDescription className="text-sm text-gray-600 mt-1">
                Ver, crear, editar y eliminar usuarios del sistema
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-gray-500">
            <Users className="h-16 w-16 opacity-50" />
            <p className="text-lg font-medium">Funcionalidad en desarrollo</p>
            <p className="text-sm">Próximamente podrás gestionar usuarios aquí</p>
          </div>
        </CardContent>
      </Card>

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

