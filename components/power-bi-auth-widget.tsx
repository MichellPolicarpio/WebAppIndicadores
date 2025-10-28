"use client"

import { useState, useEffect } from "react"
import { BarChart3, Loader2, ExternalLink, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface PowerBIAuthWidgetProps {
  company?: string
}

export function PowerBIAuthWidget({ company }: PowerBIAuthWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [authUrl, setAuthUrl] = useState("https://app.powerbi.com/reportEmbed?reportId=0fa55d40-66bd-442d-8827-eeafb03401ad&autoAuth=true&ctid=2051dfb3-8a4c-421b-9440-5c28241c68cd")

  useEffect(() => {
    // Simular tiempo de carga inicial
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
    setNeedsAuth(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleAuthRequired = () => {
    setIsLoading(false)
    setNeedsAuth(true)
  }

  const openPowerBI = () => {
    window.open("https://app.powerbi.com/groups/me/reports/0fa55d40-66bd-442d-8827-eeafb03401ad", "_blank")
  }

  if (needsAuth) {
    return (
      <div className="aspect-video bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-sky-300 p-8">
        <AlertCircle className="h-16 w-16 text-sky-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Autenticación Requerida</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Para ver el dashboard de Power BI, necesitas iniciar sesión con tu cuenta corporativa de {company}.
        </p>
        <div className="space-y-3">
          <Button onClick={openPowerBI} className="bg-sky-600 hover:bg-sky-700 text-white">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en Power BI
          </Button>
          <p className="text-xs text-gray-500 text-center">
            Se abrirá en una nueva ventana
          </p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-8">
        <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar Power BI</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          No se pudo cargar el dashboard. Verifica tu conexión a internet y permisos de acceso.
        </p>
        <div className="space-y-3">
          <Button onClick={() => window.location.reload()} className="bg-sky-600 hover:bg-sky-700 text-white">
            Reintentar
          </Button>
          <Button onClick={openPowerBI} variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50">
            <ExternalLink className="h-4 w-4 mr-2" />
            Abrir en Power BI
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex flex-col items-center justify-center z-10">
          <Loader2 className="h-8 w-8 text-sky-500 animate-spin mb-2" />
          <p className="text-gray-600 text-sm">Cargando dashboard de Power BI...</p>
        </div>
      )}
      
      {authUrl && (
        <iframe
          title="INDICADORES_GMAS_CAB"
          width="100%"
          height="541"
          src={authUrl}
          frameBorder="0"
          allowFullScreen={true}
          className="rounded-lg shadow-sm"
          style={{ minHeight: '541px' }}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
        />
      )}
    </div>
  )
}
