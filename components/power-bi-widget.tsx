"use client"

import { useState, useEffect } from "react"
import { BarChart3, Loader2 } from "lucide-react"

interface PowerBIWidgetProps {
  company?: string
}

export function PowerBIWidget({ company }: PowerBIWidgetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Simular tiempo de carga del widget
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  if (hasError) {
    return (
      <div className="aspect-video bg-gray-50 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300">
        <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
        <p className="text-gray-600 text-lg font-medium mb-2">Error al cargar Power BI</p>
        <p className="text-gray-500 text-sm text-center max-w-md">
          No se pudo cargar el dashboard de Power BI. Verifica tu conexión a internet.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 transition-colors"
        >
          Reintentar
        </button>
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
        src="https://app.powerbi.com/reportEmbed?reportId=0fa55d40-66bd-442d-8827-eeafb03401ad&autoAuth=true&ctid=2051dfb3-8a4c-421b-9440-5c28241c68cd&config=eyJjbHVzdGVyVXJsIjoiaHR0cHM6Ly9XQUJJLVVTLVdFU1QyLUEtcHJpbWFyeS5yZWRpcmVjdC5hbmFseXNpcy53aW5kb3dzLm5ldC8ifQ%3D%3D"
        frameBorder="0"
        allowFullScreen={true}
        className="rounded-lg shadow-sm"
        style={{ minHeight: '541px' }}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
      />
    </div>
  )
}
