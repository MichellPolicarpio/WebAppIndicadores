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
      <div className="fixed inset-0 bg-gradient-to-br from-[#F6FAFB] via-[#8BC8D5] to-[#4DB1C6] flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="text-center space-y-8">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-28 h-28 mx-auto border-4 border-[#0D94B1]/30 border-t-[#0D94B1] rounded-full animate-spin" />
            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#0D94B1] to-[#4DB1C6] rounded-full opacity-20 animate-pulse" />
            </div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-[#0D94B1] rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-[#0B6170] drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]">
              SIGI
            </h2>
            <p className="text-[#0B6170] text-sm">Cargando tu espacio de trabajo...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-[#0D94B1] rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-[#0D94B1] rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-[#0D94B1] rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-[#0D94B1]/30 bg-white/90 backdrop-blur-xl shadow-2xl shadow-[#0D94B1]/20">
      <CardHeader className="space-y-3 pb-6 text-center">
        <CardTitle className="text-2xl text-[#0D94B1] font-semibold">Iniciar Sesión</CardTitle>
        <CardDescription className="text-[#0D94B1]">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#0D94B1] text-sm font-medium">
              Usuario
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0D94B1]" />
              <Input
                id="email"
                type="text"
                placeholder="Ingresa tu usuario"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-white border-[#0D94B1]/30 text-[#0D94B1] placeholder:text-[#0D94B1]/60 focus:border-[#0D94B1] focus:ring-[#0D94B1]/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#0D94B1] text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#0D94B1]" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-white border-[#0D94B1]/30 text-[#0D94B1] placeholder:text-[#0D94B1]/60 focus:border-[#0D94B1] focus:ring-[#0D94B1]/20 transition-all"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="bg-red-950/50 border-red-900/50 backdrop-blur">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="ml-2">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#0D94B1] to-[#4DB1C6] hover:from-[#0D94B1] hover:to-[#0D94B1] text-white font-medium shadow-lg shadow-[#0D94B1]/30 transition-all duration-200 hover:shadow-xl hover:shadow-[#0D94B1]/40"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Iniciando sesión...
              </span>
            ) : (
              "Iniciar Sesión"
            )}
          </Button>

          {/* Panel informativo removido por solicitud */}
        </form>
      </CardContent>
    </Card>
  )
}
