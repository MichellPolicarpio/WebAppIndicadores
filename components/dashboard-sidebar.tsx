"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, PlusCircle, Settings, Menu } from "lucide-react"
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
    GMas: "bg-gradient-to-r from-green-600 to-blue-600",
    CAB: "bg-gradient-to-r from-blue-600 to-cyan-600",
  }

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
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen transition-all duration-300 z-50",
        "bg-[#0D94B1] border-r border-[#0B7A96]",
        collapsed ? "w-16" : "w-64 md:w-52 lg:w-64",
      )}
    >
      <div className="h-16 border-b border-[#0B7A96] flex items-center px-3 gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-white/80 hover:text-white hover:bg-white/10 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {!collapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`w-10 h-10 rounded-lg ${companyColors[user.company]} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}
            >
              {user.company === "GMas" ? "GM" : "CAB"}
            </div>
            <div className="min-w-0">
              <h1 className="text-white font-semibold text-sm truncate">SIVEG</h1>
              <p className="text-white/70 text-xs truncate">
                {user.company} - {user.gerencia}
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive ? "bg-white/20 text-white" : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
          <div className="bg-white/10 rounded-lg p-4 space-y-3">
            <div className="space-y-2 text-center">
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Empresa</p>
                <p className="text-sm font-semibold text-white">{user.companyFull || user.company}</p>
              </div>
              <div>
                <p className="text-xs text-white/60 uppercase tracking-wide">Gerencia</p>
                <p className="text-sm text-white/80">{user.gerencia}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-white/20">
              <p className="text-xs text-white/60 text-center">Versión 1.0.0</p>
            </div>
          </div>

          <div className="flex justify-center bg-white/20 rounded-lg p-3">
            <Image
              src={user.company === "GMas" ? "/logos/gmas-logo.png" : "/logos/cab-logo.png"}
              alt={`${user.company} Logo`}
              width={user.company === "GMas" ? 140 : 140}
              height={user.company === "GMas" ? 80 : 75}
              className="object-contain"
            />
          </div>
        </div>
      )}
    </aside>
  )
}
