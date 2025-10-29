import Image from "next/image"
import { Mail, Phone, MapPin, Calendar, BarChart3, Database, LineChart } from "lucide-react"

export function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Sección principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Columna 1: Sobre SIGIA */}
          <div>
            <h3 className="text-slate-900 font-bold text-lg mb-3 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0D94B1] flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              SIGIA
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-3">
              Sistema de Gestión de Indicadores para GMAS y CAB. Plataforma integral para el seguimiento y análisis de métricas operacionales.
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <Calendar className="h-3 w-3" />
              <span>Versión 1.0.0 • {currentYear}</span>
            </div>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h4 className="text-slate-900 font-semibold text-sm mb-3">Accesos Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/dashboard" className="text-slate-600 hover:text-[#0D94B1] transition-colors">
                  Dashboard
                </a>
              </li>
              <li>
                <a href="/dashboard/indicadores" className="text-slate-600 hover:text-[#0D94B1] transition-colors">
                  Indicadores
                </a>
              </li>
              <li>
                <a href="/dashboard/configuracion" className="text-slate-600 hover:text-[#0D94B1] transition-colors">
                  Configuración
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3: Tecnologías */}
          <div>
            <h4 className="text-slate-900 font-semibold text-sm mb-3">Construido con</h4>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <Image 
                  src="https://cdn.simpleicons.org/nextdotjs/000000" 
                  alt="Next.js" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4"
                />
                <span>Next.js 14</span>
              </div>
              <div className="flex items-center gap-2">
                <Image 
                  src="https://cdn.simpleicons.org/typescript/3178C6" 
                  alt="TypeScript" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4"
                />
                <span>TypeScript</span>
              </div>
              <div className="flex items-center gap-2">
                <Image 
                  src="https://cdn.simpleicons.org/tailwindcss/06B6D4" 
                  alt="Tailwind CSS" 
                  width={16} 
                  height={16} 
                  className="w-4 h-4"
                />
                <span>Tailwind CSS</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-red-600" />
                <span>SQL Server</span>
              </div>
              <div className="flex items-center gap-2">
                <LineChart className="w-4 h-4 text-yellow-600" />
                <span>Power BI</span>
              </div>
            </div>
          </div>

          {/* Columna 4: Contacto y soporte */}
          <div>
            <h4 className="text-slate-900 font-semibold text-sm mb-3">Soporte Técnico</h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>mmoran@grupomasagua.com</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>2291360054</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>Veracruz, Veracruz, MX</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-slate-300 mb-6"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-slate-500 text-xs">
            © {currentYear} SIGIA - Sistema de Gestión de Indicadores. Todos los derechos reservados.
          </p>
          <p className="text-slate-400 text-xs mt-1">
            Powered by ACCIONA | GMAS & CAB
          </p>
        </div>
      </div>
    </footer>
  )
}

