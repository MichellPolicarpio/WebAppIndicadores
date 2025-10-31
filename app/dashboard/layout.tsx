"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { BarChart3, Home, PlusCircle, Target, Settings, LayoutDashboard, Shield } from "lucide-react"
import { PowerBIAuthWidget } from "@/components/power-bi-auth-widget"
import { getUser, type User } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardFooter } from "@/components/dashboard-footer"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false) // Iniciar expandido

  const getPageInfo = () => {
    if (pathname === "/dashboard") return { title: "Dashboard", icon: LayoutDashboard }
    if (pathname.startsWith("/dashboard/indicadores/variable")) return { title: "Indicadores Mensuales", icon: BarChart3 }
    if (pathname.startsWith("/dashboard/indicadores/objetivo")) return { title: "Objetivos", icon: Target }
    if (pathname.startsWith("/dashboard/indicadores")) return { title: "Agregar Indicadores", icon: PlusCircle }
    if (pathname.startsWith("/dashboard/admin")) return { title: "Panel Admin", icon: Shield }
    if (pathname.startsWith("/dashboard/configuracion")) return { title: "Configuración", icon: Settings }
    return { title: "", icon: null }
  }

  useEffect(() => {
    const currentUser = getUser()
    if (!currentUser) {
      router.push("/")
    } else {
      // Proteger ruta de admin: solo usuarios con rolUsuario === 1 pueden acceder
      if (pathname.startsWith("/dashboard/admin") && currentUser.rolUsuario !== 1) {
        router.push("/dashboard")
        return
      }
      setUser(currentUser)
    }
  }, [router, pathname])

  // Ajustar sidebar según tamaño de pantalla al cargar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        // En móvil, colapsar automáticamente
        setSidebarCollapsed(true)
      }
    }
    
    // Ejecutar al cargar
    handleResize()
    
    // Escuchar cambios de tamaño
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    <div className="min-h-screen bg-[#F6FAFB] flex flex-col">
      <DashboardSidebar
        user={user}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <DashboardHeader 
        user={user} 
        sidebarCollapsed={sidebarCollapsed} 
        pageInfo={getPageInfo()} 
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className="pt-20 flex-1 flex flex-col">
        <main className={`transition-all duration-300 ml-0 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64 md:md:ml-56 md:lg:ml-64"} flex-1 flex flex-col`}>
          {/* Widget persistente: se mantiene montado para evitar recargas al volver al dashboard */}
          <div className="p-6 bg-[#F6FAFB] flex-1 flex flex-col">
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
            <div className="bg-[#F6FAFB] flex-1">{children}</div>
          </div>
          
          {/* Footer */}
          <DashboardFooter />
        </main>
      </div>
    </div>
  )
}
