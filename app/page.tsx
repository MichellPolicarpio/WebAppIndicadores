import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F6FAFB] via-[#8BC8D5] to-[#4DB1C6] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-72 h-72 bg-[#8BC8D5] rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#4DB1C6] rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#0D94B1] rounded-full blur-3xl animate-pulse delay-500 opacity-30" />
      </div>

      <div className="w-full max-w-md p-8 relative z-10 mt-4 sm:mt-0">
        <div className="text-center mb-8 sm:mb-10 space-y-2">
          <div className="inline-block">
            <h1 className="text-5xl sm:text-6xl font-bold text-[#0B6170] drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)] mb-2">
              SIGIA
            </h1>
            <div className="h-1.5 rounded-full bg-gradient-to-r from-[#0D94B1] via-[#4DB1C6] to-[#8BC8D5]" />
          </div>
          <p className="text-[#0B6170] text-sm leading-relaxed max-w-sm mx-auto">
            Sistema Integral de Gestión de Indicadores de Acciona
          </p>
          <p className="text-[#0B6170]/80 text-xs">Gestión inteligente para empresas de agua</p>
        </div>
        <LoginForm />
        
        {/* Powered by Acciona */}
        <div className="mt-32 flex flex-col items-center justify-center gap-3">
          <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Powered by</span>
          <Image
            src="/logos/aciona-logo.png"
            alt="Acciona"
            width={140}
            height={42}
            className="object-contain opacity-90 brightness-0 invert"
          />
        </div>
      </div>
    </div>
  )
}
