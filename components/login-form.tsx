"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, AlertCircle } from "lucide-react"

// Ya no usamos credenciales simuladas, ahora usamos la base de datos

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showSplash, setShowSplash] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Llamar a la API de login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: email, // Usamos email como campo de usuario
          contraseña: password
        })
      })

      const data = await response.json()

      if (data.success) {
        // Guardar usuario en localStorage
        localStorage.setItem("user", JSON.stringify(data.user))
        setShowSplash(true)

        // Wait for splash animation then redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        setError(data.message || "Credenciales incorrectas")
        setLoading(false)
      }
    } catch (error) {
      console.error('Error en login:', error)
      setError("Error de conexión. Intenta nuevamente.")
      setLoading(false)
    }
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-[#0D94B1] via-[#4DB1C6] to-[#8BC8D5] overflow-hidden z-50">
        {/* Animated background particles */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="relative flex flex-col items-center justify-center min-h-screen">
          <div className="text-center space-y-12">
            {/* Logo animado con efecto de expansión */}
            <div className="relative" style={{ animation: 'scaleIn 0.8s ease-out' }}>
              {/* Círculos externos giratorios */}
              <div className="relative w-48 h-48 mx-auto">
                {/* Anillo exterior 1 */}
                <div className="absolute inset-0 border-4 border-white/20 rounded-full" style={{ animation: 'rotate 3s linear infinite' }} />
                {/* Anillo exterior 2 */}
                <div className="absolute inset-4 border-4 border-white/30 rounded-full" style={{ animation: 'rotate 2s linear infinite reverse' }} />
                {/* Anillo exterior 3 */}
                <div className="absolute inset-8 border-4 border-white/40 rounded-full" style={{ animation: 'rotate 4s linear infinite' }} />
                
                {/* Partículas orbitando */}
                <div className="absolute inset-0" style={{ animation: 'rotate 5s linear infinite' }}>
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -ml-1.5 shadow-lg shadow-white/50" />
                </div>
                <div className="absolute inset-0" style={{ animation: 'rotate 5s linear infinite', animationDelay: '0.6s' }}>
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -ml-1.5 shadow-lg shadow-white/50" />
                </div>
                <div className="absolute inset-0" style={{ animation: 'rotate 5s linear infinite', animationDelay: '1.2s' }}>
                  <div className="absolute top-0 left-1/2 w-3 h-3 bg-white rounded-full -ml-1.5 shadow-lg shadow-white/50" />
                </div>
                
                {/* Centro brillante */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-white to-white/60 rounded-full flex items-center justify-center shadow-2xl" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
                    <svg className="w-14 h-14 text-[#0D94B1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Texto con animación de aparición */}
            <div className="space-y-6" style={{ animation: 'fadeInUp 0.8s ease-out 0.3s both' }}>
              <div className="space-y-2">
                <h2 className="text-6xl font-bold text-white drop-shadow-2xl tracking-tight" style={{ animation: 'glow 2s ease-in-out infinite' }}>
                  SIGIA
                </h2>
                <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-white to-transparent rounded-full" style={{ animation: 'expand 1.5s ease-out' }} />
              </div>
              
              <p className="text-white/90 text-lg font-light tracking-wide">
                Bienvenido a tu espacio de trabajo
              </p>
              
              {/* Barra de progreso animada */}
              <div className="w-64 h-1.5 mx-auto bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-white via-white/80 to-white rounded-full" style={{ animation: 'loadProgress 1.5s ease-in-out infinite' }} />
              </div>
              
              {/* Puntos de carga modernos */}
              <div className="flex items-center justify-center gap-2 pt-4">
                <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'bounce 1.4s ease-in-out infinite' }} />
                <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'bounce 1.4s ease-in-out 0.2s infinite' }} />
                <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'bounce 1.4s ease-in-out 0.4s infinite' }} />
                <div className="w-2.5 h-2.5 bg-white rounded-full" style={{ animation: 'bounce 1.4s ease-in-out 0.6s infinite' }} />
              </div>
            </div>
          </div>
          
          {/* Powered by Acciona */}
          <div className="absolute bottom-12 flex flex-col items-center justify-center gap-3" style={{ animation: 'fadeIn 1s ease-out 0.5s both' }}>
            <span className="text-white/70 text-[10px] font-medium uppercase tracking-wider">Powered by</span>
            <img
              src="/logos/aciona-logo.png"
              alt="Acciona"
              width={140}
              height={42}
              className="object-contain opacity-90 brightness-0 invert"
            />
          </div>
        </div>

        <style jsx>{`
          @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes fadeInUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes rotate {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes glow {
            0%, 100% { text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 0 0 30px rgba(255, 255, 255, 0.3); }
            50% { text-shadow: 0 0 30px rgba(255, 255, 255, 0.8), 0 0 40px rgba(255, 255, 255, 0.5); }
          }
          @keyframes expand {
            from { width: 0; opacity: 0; }
            to { width: 8rem; opacity: 1; }
          }
          @keyframes loadProgress {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(400%); }
          }
        `}</style>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Decorative elements around card */}
      <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
      
      <Card className="relative border-0 bg-white/95 backdrop-blur-2xl shadow-2xl shadow-black/20 overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#0D94B1] via-[#4DB1C6] to-[#8BC8D5]" />
        
        <CardHeader className="space-y-2 pb-3 pt-4 px-4 sm:px-5 text-center bg-gradient-to-b from-white to-gray-50/50">
          <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#0D94B1] to-[#4DB1C6] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shadow-[#0D94B1]/30 rotate-3 hover:rotate-0 transition-transform">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          <div className="space-y-1">
            <CardTitle className="text-lg sm:text-xl text-gray-900 font-bold">Iniciar Sesión</CardTitle>
            <CardDescription className="text-xs sm:text-sm text-gray-600">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-4 sm:px-5 pb-4 sm:pb-5">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div className="space-y-2.5 sm:space-y-3">
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs sm:text-sm text-gray-700 font-medium">Usuario</Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D94B1]/20 to-[#4DB1C6]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0D94B1]/60 z-10" />
                  <Input
                    id="email"
                    type="text"
                    placeholder="Ingresa tu usuario"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative pl-8 sm:pl-9 pr-3 py-3 sm:py-4 border-2 border-gray-200 focus:border-[#0D94B1] focus:ring-4 focus:ring-[#0D94B1]/10 rounded-lg transition-all text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs sm:text-sm text-gray-700 font-medium">Contraseña</Label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0D94B1]/20 to-[#4DB1C6]/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0D94B1]/60 z-10" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative pl-8 sm:pl-9 pr-3 py-3 sm:py-4 border-2 border-gray-200 focus:border-[#0D94B1] focus:ring-4 focus:ring-[#0D94B1]/10 rounded-lg transition-all text-xs sm:text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive" className="bg-red-50 border-2 border-red-200 text-red-700 animate-in slide-in-from-top-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="font-medium text-xs sm:text-sm">{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-[#0D94B1] to-[#4DB1C6] hover:from-[#0B7A96] hover:to-[#3A9FB8] text-white py-3 sm:py-4 rounded-lg font-semibold shadow-lg shadow-[#0D94B1]/30 hover:shadow-xl hover:shadow-[#0D94B1]/40 transition-all transform hover:-translate-y-0.5 text-xs sm:text-sm" 
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="text-xs sm:text-sm">Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>Iniciar Sesión</span>
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}