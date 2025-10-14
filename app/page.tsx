import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-8">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-800 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-800 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-800 rounded-full blur-3xl animate-pulse delay-500" />
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
