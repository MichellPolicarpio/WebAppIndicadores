"use client"

import { useState, useEffect } from "react"
import { HelpCircle, User, LogOut, Settings, BarChart3, Target, FileText, Info, Menu, Bell, Search, Database, LineChart, Home, PlusCircle, LucideIcon, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { logout, type User as UserType } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  user: UserType
  sidebarCollapsed: boolean
  pageInfo?: { title: string; icon: LucideIcon | null }
  onToggleSidebar?: () => void
}

// Función para obtener contenido de ayuda personalizado por sección
function getHelpContent(pageTitle?: string) {
  switch (pageTitle) {
    case "Dashboard":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">📊 Dashboard Principal</h3>
            <p className="text-blue-700 text-sm mb-3">
              Aquí puedes ver un resumen general de los indicadores y acceder rápidamente a las funciones principales.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Accesos Rápidos:</strong> Navega directamente a agregar indicadores u objetivos</li>
              <li>• <strong>Power BI:</strong> Visualiza reportes interactivos en tiempo real</li>
              <li>• <strong>Widgets:</strong> Información clave de tu gerencia</li>
            </ul>
          </div>
        </div>
      )
    
    case "Indicadores Mensuales":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">📈 Indicadores Mensuales</h3>
            <p className="text-blue-700 text-sm mb-3">
              Gestiona los indicadores operativos de tu gerencia por período mensual.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Selector de Mes:</strong> Navega entre meses disponibles para ver indicadores</li>
              <li>• <strong>Editar:</strong> Modifica valores de indicadores existentes</li>
              <li>• <strong>Histórico:</strong> Consulta el historial completo de cada indicador</li>
              <li>• <strong>Eliminar:</strong> Borra registros incorrectos (con confirmación)</li>
            </ul>
          </div>
        </div>
      )
    
    case "Objetivos":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">🎯 Objetivos Estratégicos</h3>
            <p className="text-blue-700 text-sm mb-3">
              Define y monitorea los objetivos estratégicos de tu área con metas y seguimiento.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Agregar Objetivo:</strong> Crea nuevos objetivos con metas específicas</li>
              <li>• <strong>Progreso:</strong> Actualiza el avance de cada objetivo</li>
              <li>• <strong>Seguimiento:</strong> Monitorea el cumplimiento por período</li>
              <li>• <strong>Reportes:</strong> Genera análisis de cumplimiento</li>
            </ul>
          </div>
        </div>
      )
    
    case "Configuración":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">⚙️ Configuración de Cuenta</h3>
            <p className="text-blue-700 text-sm mb-3">
              Administra tu perfil, información de empresa y configuración de seguridad.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Perfil:</strong> Actualiza tus datos personales</li>
              <li>• <strong>Empresa:</strong> Información de tu organización</li>
              <li>• <strong>Seguridad:</strong> Cambia tu contraseña de acceso</li>
              <li>• <strong>Sesiones:</strong> Gestiona dispositivos conectados</li>
            </ul>
          </div>
        </div>
      )
    
    case "Agregar Indicadores":
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">➕ Agregar Indicadores</h3>
            <p className="text-blue-700 text-sm mb-3">
              Selecciona el tipo de indicador que deseas agregar al sistema.
            </p>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Indicadores Mensuales:</strong> Variables operativas por período</li>
              <li>• <strong>Objetivos:</strong> Metas estratégicas con seguimiento</li>
            </ul>
          </div>
        </div>
      )
    
    default:
      return (
        <div className="space-y-4">
          <div>
            <h3 className="text-blue-900 font-semibold mb-2">❓ Ayuda General</h3>
            <p className="text-blue-700 text-sm">
              Para obtener ayuda específica, navega a la sección deseada y usa este botón de ayuda.
            </p>
          </div>
        </div>
      )
  }
}

interface Notification {
  id: string
  type: 'missing_indicators'
  title: string
  message: string
  month: string
  year: number
  monthNumber: number
  faltantes: number
  total: number
}

export function DashboardHeader({ user, sidebarCollapsed, pageInfo, onToggleSidebar }: DashboardHeaderProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  // Cargar notificaciones al montar el componente y cada 5 minutos
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications', {
          credentials: 'include',
          cache: 'no-store'
        })
        const result = await response.json()
        
        if (result.success && result.notifications) {
          setNotifications(result.notifications)
        } else {
          setNotifications([])
        }
      } catch (error) {
        console.error('Error cargando notificaciones:', error)
        setNotifications([])
      } finally {
        setLoadingNotifications(false)
      }
    }

    fetchNotifications()
    // Recargar cada 5 minutos
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000)
    
    return () => clearInterval(interval)
  }, [])

  const formatTimeAgo = (monthNumber: number, year: number) => {
    const now = new Date()
    const currentYear = now.getFullYear()
    const currentMonth = now.getMonth() + 1
    
    if (year === currentYear && monthNumber === currentMonth) {
      return "Mes actual"
    }
    
    const monthsDiff = (currentYear - year) * 12 + (currentMonth - monthNumber)
    
    if (monthsDiff === 1) {
      return "Hace 1 mes"
    } else if (monthsDiff <= 6) {
      return `Hace ${monthsDiff} meses`
    } else {
      return `${monthNumber}/${year}`
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Redirigir a la página de indicadores con el mes seleccionado
    const monthStr = `${notification.year}-${notification.monthNumber.toString().padStart(2, '0')}-01`
    router.push(`/dashboard/indicadores/variable?month=${monthStr}`)
  }
  
  return (
    <header
      className={`fixed top-0 right-0 h-20 bg-[#0D94B1] border-b border-[#0B7A96] z-40 transition-all duration-300 left-0 ${sidebarCollapsed ? "md:left-20" : "md:left-64 md:md:left-56 md:lg:left-64"} shadow-md`}
    >
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {/* Botón de hamburguesa para móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-white/80 hover:text-white hover:bg-white/10 md:hidden rounded-xl transition-all duration-200"
            title="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {pageInfo?.title && (
            <div className="flex items-center gap-3">
              {pageInfo.icon && (
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <pageInfo.icon className="h-5 w-5 text-white" />
                </div>
              )}
              <h2 className="text-2xl font-bold text-white tracking-tight">{pageInfo.title}</h2>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4">
          {/* Botón de Ayuda personalizado por sección */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-0 h-auto transition-all duration-200 mr-2"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <HelpCircle className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="h-6 w-6 text-blue-500" />
                  Ayuda - {pageInfo?.title}
                </DialogTitle>
              </DialogHeader>
              <div className="text-left space-y-4 pt-4">
                {getHelpContent(pageInfo?.title)}
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón Acerca de SIGIA */}
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-0 h-auto transition-all duration-200 mr-3"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Info className="h-4 w-4 text-white" />
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Info className="h-6 w-6 text-sky-500" />
                  Acerca de SIGIA
                </DialogTitle>
              </DialogHeader>
              <div className="text-left space-y-4 pt-4">
                <div>
                  <h3 className="text-sky-900 font-semibold mb-2">¿Qué es SIGIA?</h3>
                  <p className="text-sky-700 text-sm">
                    SIGIA es una plataforma enfocada en ofrecer una interfaz amigable para que los gerentes ingresen
                    de forma masiva indicadores mensuales y definan Objetivos, enviando los datos directamente a la
                    base de datos central de SQL Server de la empresa. Pensada para agilizar la captura y el
                    seguimiento operativo en GMAS y CAB.
                  </p>
                </div>

                <div>
                  <h3 className="text-sky-900 font-semibold mb-2">🛠️ Tecnologías del Proyecto</h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <img src="https://cdn.simpleicons.org/nextdotjs/000000" alt="Next.js" className="w-6 h-6" />
                      <span className="text-sm text-gray-700">Next.js</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <img src="https://cdn.simpleicons.org/typescript/3178C6" alt="TypeScript" className="w-6 h-6" />
                      <span className="text-sm text-gray-700">TypeScript</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <img src="https://cdn.simpleicons.org/react/149ECA" alt="React" className="w-6 h-6" />
                      <span className="text-sm text-gray-700">React</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <img src="https://cdn.simpleicons.org/tailwindcss/06B6D4" alt="Tailwind CSS" className="w-6 h-6" />
                      <span className="text-sm text-gray-700">Tailwind CSS</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 flex items-center justify-center bg-red-100 rounded">
                        <Database className="w-4 h-4 text-red-600" />
                      </div>
                      <span className="text-sm text-gray-700">SQL Server</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 rounded">
                        <LineChart className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="text-sm text-gray-700">Power BI</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sky-900 font-semibold mb-2">🏢 Empresas Asociadas</h3>
                  <div className="flex items-center justify-center gap-4">
                    <img src="/logos/gmas-logo.png" alt="GMas" className="h-16 w-auto" />
                    <img src="/logos/cab-logo.png" alt="CAB" className="h-8 w-auto" />
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-200 flex items-center justify-between gap-3">
                  <p className="text-sky-600 text-xs">
                    Versión 1.0.0 | Para soporte técnico, contacta al administrador del sistema.
                  </p>
                  <img src="/logos/aciona-logo.png" alt="ACCIONA" className="h-6 object-contain opacity-80" />
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón de Notificaciones */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-0 h-auto transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center relative">
                  <Bell className="h-4 w-4 text-white" />
                  {/* Badge de notificaciones dinámico */}
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0D94B1] flex items-center justify-center">
                      <span className="text-[8px] font-bold text-white">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    </span>
                  )}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-white border-gray-200 shadow-xl">
              <DropdownMenuLabel className="text-gray-900 flex items-center justify-between">
                <span className="font-semibold">Notificaciones</span>
                {notifications.length > 0 && (
                  <span className="text-xs text-gray-500 font-normal">
                    {notifications.length} {notifications.length === 1 ? 'nueva' : 'nuevas'}
                  </span>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <div className="max-h-[400px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Bell className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-medium">No hay notificaciones</p>
                    <p className="text-xs text-gray-400 mt-1">Todos tus indicadores están completos</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id}
                      className="flex flex-col items-start gap-1 p-3 hover:bg-blue-50 cursor-pointer focus:bg-blue-50"
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-2 w-full">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 break-words">{notification.message}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(notification.monthNumber, notification.year)}
                            </span>
                            <span className="text-xs text-red-600 font-semibold">
                              {notification.faltantes}/{notification.total} faltantes
                            </span>
                          </div>
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </div>
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator className="bg-gray-200" />
                  <DropdownMenuItem 
                    className="text-center justify-center text-blue-600 hover:bg-blue-50 focus:bg-blue-50 cursor-pointer font-medium"
                    onClick={() => router.push('/dashboard/indicadores/variable')}
                  >
                    Ir a Indicadores
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Separador - oculto en móvil */}
          <div className="hidden md:block h-6 w-px bg-white/20 ml-3 mr-0"></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl p-0 md:px-3 h-auto transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm font-medium hidden md:inline">{user.name || user.usuario}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-white border-gray-200 shadow-lg">
              <DropdownMenuLabel className="text-gray-900">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user.name || user.usuario}</p>
                  <p className="text-xs text-gray-600">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem onClick={() => router.push("/dashboard/configuracion")} className="text-gray-700 focus:bg-gray-100 focus:text-gray-900 cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
