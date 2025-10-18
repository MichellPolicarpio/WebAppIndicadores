"use client"

import { HelpCircle, User, LogOut, Settings, BarChart3, Target, FileText, Info, Menu } from "lucide-react"
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

interface DashboardHeaderProps {
  user: UserType
  sidebarCollapsed: boolean
  pageTitle?: string
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
              <li>• <strong>Navegación:</strong> Usa los botones para acceder a cada sección</li>
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

export function DashboardHeader({ user, sidebarCollapsed, pageTitle, onToggleSidebar }: DashboardHeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#0D94B1] border-b border-[#0B7A96] z-40 transition-all duration-300 left-0 ${sidebarCollapsed ? "md:left-16" : "md:left-64 md:md:left-52 md:lg:left-64"}`}
    >
      <div className="h-full flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          {/* Botón de hamburguesa para móvil */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="text-white/80 hover:text-white hover:bg-white/10 md:hidden"
            title="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          {pageTitle && (
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-wide">{pageTitle}</h2>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {/* Botón de Ayuda personalizado por sección */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="h-6 w-6 text-blue-500" />
                  Ayuda - {pageTitle}
                </DialogTitle>
              </DialogHeader>
              <div className="text-left space-y-4 pt-4">
                {getHelpContent(pageTitle)}
              </div>
            </DialogContent>
          </Dialog>

          {/* Botón Acerca de SIGIA */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <Info className="h-5 w-5" />
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
                        <span className="text-xs font-bold text-red-600">SQL</span>
                      </div>
                      <span className="text-sm text-gray-700">SQL Server</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-6 h-6 flex items-center justify-center bg-yellow-100 rounded">
                        <span className="text-xs font-bold text-yellow-600">BI</span>
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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span className="text-sm hidden md:inline">{user.name || user.usuario}</span>
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
              <DropdownMenuItem className="text-gray-700 focus:bg-gray-100 focus:text-gray-900">
                <Settings className="mr-2 h-4 w-4" />
                <span>Configuración</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:bg-red-50 focus:text-red-700">
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
