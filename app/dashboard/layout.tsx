"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
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
          <div className="p-6 bg-[#F6FAFB] min-h-screen">{children}</div>
        </main>
      </div>
    </div>
  )
}
