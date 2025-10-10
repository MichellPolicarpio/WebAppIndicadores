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

// Credenciales simuladas
const MOCK_USERS = [
  {
    email: "admin.gmas@gmas.com",
    password: "gmas123",
    company: "GMas",
    gerencia: "Operaciones",
    name: "Erick Guillaumin",
  },
  {
    email: "gerente.gmas@gmas.com",
    password: "gmas123",
    company: "GMas",
    gerencia: "Comercial",
    name: "María González",
  },
  {
    email: "admin.cab@cab.com",
    password: "cab123",
    company: "CAB",
    gerencia: "Operaciones",
    name: "Nadia Portugal",
  },
  {
    email: "gerente.cab@cab.com",
    password: "cab123",
    company: "CAB",
    gerencia: "Finanzas",
    name: "Ana Martínez",
  },
]

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

    // Simular delay de autenticación
    await new Promise((resolve) => setTimeout(resolve, 500))

    const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

    if (user) {
      localStorage.setItem("user", JSON.stringify(user))
      setShowSplash(true)

      // Wait for splash animation then redirect
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } else {
      setError("Credenciales incorrectas")
      setLoading(false)
    }
  }

  if (showSplash) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 flex items-center justify-center z-50 animate-in fade-in duration-300">
        <div className="text-center space-y-8">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-28 h-28 mx-auto border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full opacity-20 animate-pulse" />
            </div>
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-ping" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              SIVEG
            </h2>
            <p className="text-slate-400 text-sm">Cargando tu espacio de trabajo...</p>
            <div className="flex items-center justify-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="border-slate-700/50 bg-slate-900/80 backdrop-blur-xl shadow-2xl shadow-blue-900/20">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl text-white font-semibold">Iniciar Sesión</CardTitle>
        <CardDescription className="text-slate-400">Ingresa tus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-200 text-sm font-medium">
              Correo Electrónico
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="email"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-slate-200 text-sm font-medium">
              Contraseña
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
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
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium shadow-lg shadow-blue-900/30 transition-all duration-200 hover:shadow-xl hover:shadow-blue-900/40"
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

          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg backdrop-blur">
            <div className="text-xs text-slate-400 mb-3 font-semibold flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
              Credenciales de prueba
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">GMas:</span>
                <span className="text-slate-300 font-mono">admin.gmas@gmas.com / gmas123</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-800/50 rounded">
                <span className="text-slate-400">CAB:</span>
                <span className="text-slate-300 font-mono">admin.cab@cab.com / cab123</span>
              </div>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
