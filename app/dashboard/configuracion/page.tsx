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
    <div className="min-h-screen bg-[#F6FAFB] p-4 sm:p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Encabezado redundante removido: el header global ya indica la sección */}

      {saved && (
        <Alert className="bg-green-950/50 border-green-900">
          <AlertDescription className="text-green-400">Los cambios se han guardado correctamente</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="perfil" className="space-y-6">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="perfil" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
            <UserIcon className="h-4 w-4 mr-2" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="empresa" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
            <Building2 className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="seguridad" className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="perfil" className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Información Personal</CardTitle>
              <CardDescription className="text-gray-600">
                Actualiza tu información de perfil y datos de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserIcon className="h-10 w-10 text-gray-600" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="usuario" className="text-gray-700">
                    Usuario
                  </Label>
                  <Input
                    id="usuario"
                    value={formData.usuario}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="correo" className="text-gray-700">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombres" className="text-gray-700">
                    Nombre(s)
                  </Label>
                  <Input
                    id="nombres"
                    value={formData.nombres}
                    onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Nombre(s)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidoPaterno" className="text-gray-700">
                    Apellido Paterno
                  </Label>
                  <Input
                    id="apellidoPaterno"
                    value={formData.apellidoPaterno}
                    onChange={(e) => setFormData({ ...formData, apellidoPaterno: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Apellido Paterno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="apellidoMaterno" className="text-gray-700">
                    Apellido Materno
                  </Label>
                  <Input
                    id="apellidoMaterno"
                    value={formData.apellidoMaterno}
                    onChange={(e) => setFormData({ ...formData, apellidoMaterno: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                    placeholder="Apellido Materno"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gerencia" className="text-gray-700">
                    Gerencia
                  </Label>
                  <Input
                    id="gerencia"
                    value={formData.gerencia}
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="empresa" className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Información de la Empresa</CardTitle>
              <CardDescription className="text-gray-600">Detalles de tu organización</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-100 rounded-lg">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex items-center justify-center shadow-sm">
                  <img
                    src={user.company === "GMas" ? "/logos/gmas-logo.png" : "/logos/cab-logo.png"}
                    alt={`Logo ${user.company}`}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {user.company === "GMas" ? "Grupo Mas Agua" : "Compañía de Agua de Boca del Río"}
                  </h3>
                  <p className="text-sm text-gray-600">{user.company}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700">Empresa</Label>
                  <Input value={user.company} disabled className="bg-gray-100 border-gray-300 text-gray-500" />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Gerencia</Label>
                  <Input value={user.gerencia} disabled className="bg-gray-100 border-gray-300 text-gray-500" />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Ubicación</Label>
                  <Input value="Veracruz, México" disabled className="bg-gray-100 border-gray-300 text-gray-500" />
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-700">Zona Horaria</Label>
                  <Input
                    value="GMT-6 (Ciudad de México)"
                    disabled
                    className="bg-gray-100 border-gray-300 text-gray-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

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
  )
}
