import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
              SIVEG
            </h1>
            <div className="h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full" />
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-sm mx-auto">
            Sistema Integral de Visualización y Evaluación de Gestión
          </p>
          <p className="text-slate-500 text-xs">Gestión inteligente para empresas de agua</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
