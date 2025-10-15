"use client"

import { HelpCircle, User, LogOut, Settings, BarChart3, Target, FileText } from "lucide-react"
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
}

export function DashboardHeader({ user, sidebarCollapsed, pageTitle }: DashboardHeaderProps) {
  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-[#0D94B1] border-b border-[#0B7A96] z-40 transition-all duration-300 ${sidebarCollapsed ? "left-16" : "left-64 md:left-52 lg:left-64"}`}
    >
      <div className="h-full flex items-center justify-between px-6">
        {pageTitle && (
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wide">{pageTitle}</h2>
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white hover:bg-white/10">
                <HelpCircle className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <HelpCircle className="h-6 w-6 text-sky-500" />
                  Acerca de SIVEG
                </DialogTitle>
              </DialogHeader>
              <div className="text-left space-y-4 pt-4">
                <div>
                  <h3 className="text-sky-900 font-semibold mb-2">¿Qué es SIVEG?</h3>
                  <p className="text-sky-700 text-sm">
                    SIVEG (Sistema Integral de Visualización y Evaluación de Gestión) es una plataforma diseñada para
                    las empresas de agua GMas (Grupo Mas Agua) y CAB (Compañía de Agua del Municipio de Boca del Río)
                    que permite gestionar, visualizar y evaluar indicadores de desempeño operacional.
                  </p>
                </div>

                <div>
                  <h3 className="text-sky-900 font-semibold mb-2">¿Qué puedes hacer aquí?</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <BarChart3 className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sky-800 font-medium">Dashboard Interactivo</p>
                        <p className="text-sky-700 text-sm">
                          Visualiza métricas clave y reportes de Power BI en tiempo real para monitorear el desempeño de
                          tu gerencia.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Target className="h-5 w-5 text-sky-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sky-800 font-medium">Gestión de Indicadores</p>
                        <p className="text-sky-700 text-sm">
                          Agrega, edita y da seguimiento a variables operacionales y objetivos estratégicos de tu área.
                          Consulta el histórico de cada indicador para análisis de tendencias.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <FileText className="h-5 w-5 text-sky-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sky-800 font-medium">Reportes y Análisis</p>
                        <p className="text-sky-700 text-sm">
                          Genera reportes personalizados y analiza el cumplimiento de objetivos por periodo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-sky-200">
                  <p className="text-sky-600 text-xs">
                    Versión 1.0.0 | Para soporte técnico, contacta al administrador del sistema.
                  </p>
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
