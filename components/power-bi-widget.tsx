"use client"

import { useState, useEffect } from "react"
import { BarChart3, Loader2 } from "lucide-react"

interface PowerBIWidgetProps {
  company?: string
}

export function PowerBIWidget({ company }: PowerBIWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)

  useEffect(() => {
    // Simular tiempo de carga del widget - más tiempo para Power BI
    const timer = setTimeout(() => {
      setIsLoading(false)
      // Si después de 10 segundos no se ha cargado, asumir que necesita autenticación
      setTimeout(() => {
        if (isLoading) {
          setNeedsAuth(true)
        }
      }, 10000)
    }, 5000)

    return () => clearTimeout(timer)
  }, [isLoading])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleAuthRequired = () => {
    setIsLoading(false)
    setNeedsAuth(true)
  }

  if (needsAuth) {
    return (
      <div className="aspect-video bg-gradient-to-br from-sky-50 to-blue-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-sky-300 p-8">
        <BarChart3 className="h-16 w-16 text-sky-500 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Autenticación Requerida</h3>
        <p className="text-gray-600 text-center max-w-md mb-6">
          Para ver el dashboard de Power BI, necesitas iniciar sesión con tu cuenta corporativa.
        </p>
        <div className="space-y-3">
          <button 
            onClick={() => window.open("https://app.powerbi.com/groups/me/reports/0fa55d40-66bd-442d-8827-eeafb03401ad", "_blank")} 
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
          >
            Abrir en Power BI
          </button>
          <p className="text-xs text-gray-500 text-center">
            Se abrirá en una nueva ventana
          </p>
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6">
        <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg font-medium mb-2">Error al cargar Power BI</p>
        <p className="text-gray-500 text-sm text-center max-w-md mb-4">
          No se pudo cargar el dashboard de Power BI. Esto puede deberse a problemas de autenticación o permisos.
        </p>
        <div className="space-y-2">
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors mr-2"
          >
            Reintentar
          </button>
          <button 
            onClick={() => window.open("https://app.powerbi.com/groups/me/reports/0fa55d40-66bd-442d-8827-eeafb03401ad", "_blank")} 
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Abrir en Power BI
          </button>
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
      
      <iframe
        title="INDICADORES_GMAS_CAB"
        width="100%"
        height="541"
        src="https://app.powerbi.com/reportEmbed?reportId=0fa55d40-66bd-442d-8827-eeafb03401ad&autoAuth=true&ctid=2051dfb3-8a4c-421b-9440-5c28241c68cd"
        frameBorder="0"
        allowFullScreen={true}
        className="rounded-lg shadow-sm"
        style={{ minHeight: '541px' }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation"
      />
    </div>
  )
}
