"use client"

import { useState, useEffect } from "react"
import { getUser, type User } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserIcon, Building2, Bell, Shield, Save, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ConfiguracionPage() {
  const [user, setUser] = useState<User | null>(null)
  const [saved, setSaved] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [formData, setFormData] = useState({
    nombres: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    correo: "",
    usuario: "",
    gerencia: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        nombres: currentUser.nombres || "",
        apellidoPaterno: currentUser.apellidoPaterno || "",
        apellidoMaterno: currentUser.apellidoMaterno || "",
        correo: currentUser.correo || "",
        usuario: currentUser.usuario || "",
        gerencia: currentUser.gerencia || "",
      })
    }
  }, [])

  const handleSave = async () => {
    if (!user) return

    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombres: formData.nombres,
          apellidoPaterno: formData.apellidoPaterno,
          apellidoMaterno: formData.apellidoMaterno,
          correo: formData.correo,
        }),
      })

      const json = await res.json()

      if (!json.success) {
        throw new Error(json.message || 'Error al guardar')
      }

      // Actualizar localStorage con nuevos datos
      if (json.user) {
        localStorage.setItem('user', JSON.stringify(json.user))
        setUser(json.user)
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (error: any) {
      console.error('Error al guardar:', error)
      alert(error.message || 'Error al guardar los cambios')
    }
  }

  const handlePasswordChange = async () => {
    if (!user) return

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      alert("Todos los campos son requeridos")
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Las contraseñas nuevas no coinciden")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres")
      return
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setPasswordSaved(true)
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
        setTimeout(() => setPasswordSaved(false), 3000)
      } else {
        alert(result.message || "Error cambiando contraseña")
      }
    } catch (error) {
      console.error("Error cambiando contraseña:", error)
      alert("Error interno del servidor")
    }
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Encabezado redundante removido: el header global ya indica la sección */}

      {saved && (
        <Alert className="bg-green-950/50 border-green-900">
          <AlertDescription className="text-green-400">Los cambios se han guardado correctamente</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda: Perfil y Empresa combinados */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="border-gray-200 bg-white shadow-sm">
             <CardHeader>
               <CardTitle className="text-gray-900">Información Personal y Empresa</CardTitle>
               <CardDescription className="text-gray-600">
                 Información de tu cuenta y empresa (solo lectura)
               </CardDescription>
             </CardHeader>
            <CardContent className="pt-4">
              {/* Diseño en grid compacto vertical */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Nombre completo</p>
                  <p className="text-sm font-medium text-gray-900">
                    {`${formData.nombres || ''} ${formData.apellidoPaterno || ''} ${formData.apellidoMaterno || ''}`.trim() || '-'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Usuario</p>
                  <p className="text-sm font-medium text-gray-900">{formData.usuario || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Correo</p>
                  <p className="text-sm font-medium text-gray-900">{formData.correo || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500">Empresa</p>
                  <p className="text-sm font-medium text-gray-900">
                    {user.company === "GMas" 
                      ? "Grupo Metropolitano de Agua y Saneamiento" 
                      : user.company === "CAB"
                      ? "Compañía de Agua de Boca del Río"
                      : user.company || '-'}
                  </p>
                </div>
                {user.rolUsuario !== 1 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Gerencia</p>
                    <p className="text-sm font-medium text-gray-900">{formData.gerencia || '-'}</p>
                  </div>
                )}
              </div>
              
              {/* Logo de empresa al final de la card */}
              <div className="pt-4 border-t border-gray-200 flex flex-col items-center justify-center gap-3">
                <div className="w-32 h-32 rounded-lg overflow-hidden bg-white border border-gray-200 flex items-center justify-center shadow-md">
                  <img
                    src={user.company === "GMas" ? "/logos/gmas-logo.png" : "/logos/cab-logo.png"}
                    alt={`Logo ${user.company}`}
                    className="w-full h-full object-contain p-3"
                  />
                </div>
                <p className="text-xs font-medium text-gray-600 text-center">
                  {user.company === "GMas" 
                    ? "Grupo Metropolitano de Agua y Saneamiento" 
                    : user.company === "CAB"
                    ? "Compañía de Agua de Boca del Río"
                    : user.company || '-'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Seguridad */}
        <div className="space-y-6">
          <Tabs defaultValue="seguridad" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 shadow-sm w-full">
              <TabsTrigger value="seguridad" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700 flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Seguridad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="seguridad" className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Seguridad de la Cuenta</CardTitle>
              <CardDescription className="text-gray-600">
                Administra tu contraseña y configuración de seguridad
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {passwordSaved && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-800">
                    ✅ Contraseña actualizada correctamente
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-gray-700">
                  Nueva Contraseña
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-gray-700">
                  Confirmar Nueva Contraseña
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handlePasswordChange} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
