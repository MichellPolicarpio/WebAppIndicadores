"use client"

import { useEffect, useState } from "react"
import { getUser, type User } from "@/lib/auth"
import { BarChart3 } from "lucide-react"
import { PowerBIAuthWidget } from "@/components/power-bi-auth-widget"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  return (
    <div className="space-y-6">
      {/* Power BI Widget */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Últimas Actualizaciones</h3>
          <div className="space-y-3">
            {[
              { title: "Indicador de consumo actualizado", time: "Hace 2 horas" },
              { title: "Nuevo objetivo agregado", time: "Hace 5 horas" },
              { title: "Reporte mensual generado", time: "Hace 1 día" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-sky-500 rounded-full mt-2" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accesos Rápidos</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Agregar Variable", icon: PlusCircle, href: "/dashboard/indicadores/variable" },
              { label: "Agregar Objetivo", icon: PlusCircle, href: "/dashboard/indicadores/objetivo" },
              { label: "Ver Reportes", icon: BarChart3, href: "/dashboard" },
              { label: "Configuración", icon: Settings, href: "/dashboard/configuracion" },
            ].map((item) => {
              const Icon = item.icon
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-sky-50 transition-colors group"
                >
                  <Icon className="h-6 w-6 text-gray-500 group-hover:text-sky-500 transition-colors mb-2" />
                  <span className="text-xs text-gray-700 text-center">{item.label}</span>
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusCircle({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path strokeWidth="2" d="M12 8v8M8 12h8" />
    </svg>
  )
}

function Settings({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeWidth="2" d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
      <path
        strokeWidth="2"
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"
      />
    </svg>
  )
}
