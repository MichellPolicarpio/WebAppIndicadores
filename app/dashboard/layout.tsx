"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BarChart3 } from "lucide-react"
import { PowerBIAuthWidget } from "@/components/power-bi-auth-widget"
import { getUser, type User } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Dashboard"
    if (pathname.startsWith("/dashboard/indicadores/variable")) return "Variables"
    if (pathname.startsWith("/dashboard/indicadores/objetivo")) return "Objetivos"
    if (pathname.startsWith("/dashboard/indicadores")) return "Agregar Indicadores"
    if (pathname.startsWith("/dashboard/configuracion")) return "Configuración"
    return ""
  }

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
    } else {
      setUser(currentUser)
    }
  }, [router])

  // Forzar scroll al tope al entrar a /dashboard para evitar saltos (siempre declarado)
  useEffect(() => {
    if (pathname === "/dashboard") {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior })
    }
  }, [pathname])

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6FAFB]">
      <DashboardSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <DashboardHeader user={user} sidebarCollapsed={sidebarCollapsed} pageTitle={getPageTitle()} />
      <div className="pt-16">
        <main className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64 md:ml-52 lg:ml-64"}`}>
          {/* Widget persistente: se mantiene montado para evitar recargas al volver al dashboard */}
          <div className="p-6 bg-[#F6FAFB]">
            <div className={pathname === "/dashboard" ? "block" : "hidden"} style={{ overflowAnchor: "none" }}>
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="border-b border-gray-200 p-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-sky-500" />
                    Análisis de Indicadores - Power BI
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">Visualización en tiempo real de los indicadores clave</p>
                </div>
                <div className="p-6">
                  <PowerBIAuthWidget company={user?.company} />
                </div>
              </div>
            </div>
            {/* Contenido de la página */}
            <div className="bg-[#F6FAFB] min-h-screen">{children}</div>
          </div>
        </main>
      </div>
    </div>
  )
}
