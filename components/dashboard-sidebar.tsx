"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle, Settings, Menu, ChevronLeft, BarChart3, Building2 } from "lucide-react"
import Image from "next/image"
import type { User } from "@/lib/auth"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DashboardSidebarProps {
  user: User
  collapsed: boolean
  onToggle: () => void
}

export function DashboardSidebar({ user, collapsed, onToggle }: DashboardSidebarProps) {
  const pathname = usePathname()

  const companyColors = {
    GMas: "from-emerald-600 to-teal-600",
    CAB: "from-blue-600 to-indigo-600",
  }
  
  const companyGradient = companyColors[user.company] || "from-blue-600 to-indigo-600"

  const menuItems = [
    {
      label: "Inicio",
      icon: Home,
      href: "/dashboard",
      exact: true,
    },
    {
      label: "Agregar Indicadores",
      icon: PlusCircle,
      href: "/dashboard/indicadores",
    },
    {
      label: "Configuración",
      icon: Settings,
      href: "/dashboard/configuracion",
    },
  ]

  return (
    <>
      {/* Overlay para móvil */}
      {!collapsed && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={onToggle}
        />
      )}
      
      <aside
        className={cn(
          "fixed left-0 top-0 h-screen transition-all duration-300 z-50",
          "bg-[#0D94B1] shadow-2xl",
          "border-r border-[#0B7A96]",
          // En móvil: oculto por defecto, se muestra como overlay
          "md:block",
          collapsed ? "w-20" : "w-64 md:w-56 lg:w-64",
          // En móvil: transform para ocultar/mostrar
          "md:translate-x-0",
          collapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
      {/* Header del Sidebar */}
      <div className="h-20 border-b border-[#0B7A96] flex items-center pl-2 pr-4 gap-3 bg-[#0C85A0] relative">
        {/* Hamburguesa centrada cuando está colapsado */}
        {collapsed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="text-white/90 hover:text-white hover:bg-white/10 flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 rounded-xl w-14 h-14"
              title="Expandir menú"
            >
              <svg className="h-8 w-8 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            </Button>
          </div>
        )}
        
        {/* Chevron a la izquierda cuando está expandido */}
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-white/90 hover:text-white hover:bg-white/10 flex-shrink-0 transition-all duration-300 hover:scale-110 active:scale-95 rounded-xl w-14 h-14"
            title="Colapsar menú"
          >
            <ChevronLeft className="h-8 w-8 transition-transform duration-300 stroke-[3]" strokeWidth="3" />
          </Button>
        )}

        <div className={cn(
          "flex items-center gap-3 overflow-hidden flex-1 transition-opacity duration-300",
          collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center flex-shrink-0 shadow-lg group">
            <BarChart3 className="h-6 w-6 text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 animate-[pulse_4s_ease-in-out_infinite]" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-white font-bold text-lg tracking-tight">SIGIA</h1>
            <p className="text-white/80 text-[10px] font-medium leading-tight whitespace-pre-wrap">
              Sistema de Gestión de Indicadores
            </p>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <nav className="p-3 space-y-1.5 mt-2">
        {menuItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                "relative overflow-hidden",
                isActive 
                  ? "bg-white/20 text-white shadow-lg border border-white/30" 
                  : "text-white/70 hover:bg-white/10 hover:text-white border border-transparent",
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full" />
              )}
              <Icon className={cn(
                "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                isActive ? "text-white" : "text-white/70 group-hover:text-white",
                "group-hover:scale-110"
              )} />
              {!collapsed && (
                <span className={cn(
                  "text-sm font-semibold tracking-wide",
                  isActive ? "text-white" : "text-white/70 group-hover:text-white"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className={cn(
        "absolute bottom-4 left-0 right-0 px-4 space-y-3 transition-opacity duration-300",
        collapsed ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        {/* Info de Usuario */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg">
            <div className="space-y-3">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-md">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs text-white/60 font-medium uppercase tracking-wider">Empresa</p>
                </div>
                <p className="text-xs font-bold text-white leading-relaxed whitespace-pre-wrap">{user.companyFull || user.company}</p>
              </div>
              <div className="pt-2 border-t border-white/20 text-center">
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-2">Gerencia</p>
                <p className="text-xs text-white/90 font-semibold leading-relaxed whitespace-pre-wrap">{user.gerencia}</p>
              </div>
            </div>
          </div>

          {/* Logo */}
          <div className="relative flex justify-center bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 shadow-lg overflow-hidden group hover:bg-white/15 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
            {/* Brillo sutil animado en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
            <Image
              src={user.company === "GMas" ? "/logos/gmas-logo.png" : "/logos/cab-logo.png"}
              alt={`${user.company} Logo`}
              width={user.company === "GMas" ? 140 : 140}
              height={user.company === "GMas" ? 80 : 75}
              className={`object-contain opacity-90 group-hover:opacity-100 transition-opacity duration-300 relative z-10 brightness-0 invert ${user.company !== "GMas" ? "py-4" : ""}`}
            />
          </div>
          
        {/* Versión */}
        <div className="text-center">
          <p className="text-xs text-white/50 font-medium">v1.0.0</p>
        </div>
      </div>
      </aside>
    </>
  )
}
