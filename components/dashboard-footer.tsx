export function DashboardFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-b from-slate-50 to-slate-100 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Copyright */}
        <div className="text-center">
          <p className="text-slate-600 text-sm font-medium">
            © {currentYear} SIGIA - Sistema de Gestión de Indicadores. Todos los derechos reservados.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Powered by ACCIONA | GMAS & CAB
          </p>
        </div>
      </div>
    </footer>
  )
}

