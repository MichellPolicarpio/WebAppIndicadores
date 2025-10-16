import { LoginForm } from "@/components/login-form"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0D94B1] via-[#4DB1C6] to-[#8BC8D5] relative overflow-hidden">
      {/* Animated geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        {/* Floating circles */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }} />
        <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '0.5s' }} />
        
        {/* Animated shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border-2 border-white/20 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-40 left-40 w-24 h-24 border-2 border-white/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      </div>

      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 relative z-10 grid lg:grid-cols-2 gap-1 lg:gap-2 items-center min-h-screen py-6">
        {/* Left side - Hero content */}
        <div className="hidden lg:block text-white">
          <div className="space-y-4 text-center -mt-12 mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs font-medium">Sistema Activo</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-bold leading-tight">
              Bienvenido a<br />
              <span className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                SIGIA
              </span>
            </h1>
            
            <p className="text-base xl:text-lg text-white/80 leading-relaxed max-w-sm mx-auto">
              Sistema Integral de Gestión de Indicadores de Acciona
            </p>
          </div>

          {/* Company Logos */}
          <div className="space-y-4">
            <div className="text-xs text-white/70 font-medium uppercase tracking-wider">
              Empresas Asociadas
            </div>
            
            <div className="grid grid-cols-2 gap-3 xl:gap-4">
              {/* GMas Logo */}
              <div className="bg-white/10 backdrop-blur-sm p-4 xl:p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all group">
                <Image
                  src="/logos/gmas-logo.png"
                  alt="GMas - Grupo Mas Agua"
                  width={120}
                  height={68}
                  className="object-contain w-full h-auto brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
              
              {/* CAB Logo */}
              <div className="bg-white/10 backdrop-blur-sm p-4 xl:p-5 rounded-xl border border-white/20 hover:bg-white/15 transition-all group flex items-center justify-center">
                <Image
                  src="/logos/cab-logo.png"
                  alt="CAB - Compañía de Agua de Boca del Río"
                  width={100}
                  height={56}
                  className="object-contain brightness-0 invert opacity-90 group-hover:opacity-100 transition-opacity"
                />
              </div>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-white/60 text-xs">
                Gestión inteligente para empresas de agua
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full max-w-xs sm:max-w-sm mx-auto lg:mx-0 lg:ml-auto lg:max-w-sm">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-4 sm:mb-6 space-y-1.5 sm:space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg">
              SIGIA
            </h1>
            <p className="text-white/90 text-xs sm:text-sm">
              Sistema Integral de Gestión de Indicadores
            </p>
          </div>

          <LoginForm />

          {/* Powered by Acciona */}
          <div className="mt-4 sm:mt-6 flex flex-col items-center justify-center gap-1.5 sm:gap-2">
            <span className="text-white/60 text-[9px] font-medium uppercase tracking-wider">Powered by</span>
            <Image
              src="/logos/aciona-logo.png"
              alt="Acciona"
              width={100}
              height={30}
              className="object-contain opacity-80 brightness-0 invert"
            />
          </div>
        </div>
      </div>
    </div>
  )
}