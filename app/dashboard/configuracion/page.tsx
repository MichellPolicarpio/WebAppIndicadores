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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    notifications: true,
    emailNotifications: true,
    reportFrequency: "weekly",
  })

  useEffect(() => {
    const currentUser = getUser()
    if (currentUser) {
      setUser(currentUser)
      setFormData({
        name: currentUser.name,
        email: currentUser.email,
        phone: "+52 229 123 4567",
        department: currentUser.gerencia,
        notifications: true,
        emailNotifications: true,
        reportFrequency: "weekly",
      })
    }
  }, [])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#F6FAFB] p-4 sm:p-6">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Configuración</h1>
          <p className="text-gray-600">Administra tu cuenta y preferencias del sistema</p>
        </div>

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
          <TabsTrigger
            value="notificaciones"
            className="data-[state=active]:bg-sky-100 data-[state=active]:text-sky-900 text-gray-700"
          >
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
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
                  <Label htmlFor="name" className="text-gray-700">
                    Nombre Completo
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-700">
                    Teléfono
                  </Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department" className="text-gray-700">
                    Gerencia
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
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
                <div
                  className={`w-16 h-16 rounded-lg ${user.company === "GMas" ? "bg-blue-600" : "bg-cyan-600"} flex items-center justify-center text-gray-900 font-bold text-xl`}
                >
                  {user.company === "GMas" ? "GM" : "CAB"}
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

        <TabsContent value="notificaciones" className="space-y-6">
          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Preferencias de Notificaciones</CardTitle>
              <CardDescription className="text-gray-600">
                Configura cómo y cuándo deseas recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-blue-500" />
                    <Label htmlFor="notifications" className="text-slate-200 font-medium">
                      Notificaciones del Sistema
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">Recibe alertas sobre cambios en indicadores y objetivos</p>
                </div>
                <Switch
                  id="notifications"
                  checked={formData.notifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, notifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <Label htmlFor="emailNotifications" className="text-slate-200 font-medium">
                      Notificaciones por Email
                    </Label>
                  </div>
                  <p className="text-sm text-gray-600">Recibe resúmenes y reportes por correo electrónico</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => setFormData({ ...formData, emailNotifications: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportFrequency" className="text-gray-700">
                  Frecuencia de Reportes
                </Label>
                <Select
                  value={formData.reportFrequency}
                  onValueChange={(value) => setFormData({ ...formData, reportFrequency: value })}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-100 border-slate-700">
                    <SelectItem value="daily" className="text-gray-900 focus:bg-slate-700">
                      Diario
                    </SelectItem>
                    <SelectItem value="weekly" className="text-gray-900 focus:bg-slate-700">
                      Semanal
                    </SelectItem>
                    <SelectItem value="monthly" className="text-gray-900 focus:bg-slate-700">
                      Mensual
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Preferencias
                </Button>
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
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-gray-700">
                  Contraseña Actual
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
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
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                  <Save className="h-4 w-4 mr-2" />
                  Actualizar Contraseña
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900">Sesiones Activas</CardTitle>
              <CardDescription className="text-gray-600">Dispositivos donde has iniciado sesión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Navegador Actual</p>
                    <p className="text-xs text-gray-600">Veracruz, México • Activo ahora</p>
                  </div>
                  <span className="text-xs text-green-400 font-medium">Activo</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
