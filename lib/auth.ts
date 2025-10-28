// Sistema de autenticación principal

import { authenticateUserReal, getUserByIdReal } from './auth-real'
import { authenticateUserSimple, getUserByIdSimple } from './auth-simple'

// Estructura de datos del usuario
export interface User {
  id: number
  usuario: string
  correo: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  empresaOperadora: number // 1=GMas, 2=CAB
  idEmpresa_Gerencia: number
  estatusUsuario: number
  rolUsuario: number
  email: string
  company: string // "GMas" o "CAB"
  companyFull?: string // Nombre completo
  gerencia: string
  name: string
}

// Obtiene usuario desde localStorage
export function getUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("user")
  if (!userStr) return null

  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Cierra sesión y limpia datos
export function logout(showSplash: boolean = true) {
  if (showSplash) {
    // Mostrar splash screen de cierre de sesión
    const splashDiv = document.createElement('div')
    splashDiv.innerHTML = `
      <div class="fixed inset-0 bg-gradient-to-br from-[#0D94B1] via-[#4DB1C6] to-[#8BC8D5] flex flex-col items-center justify-center z-50" style="animation: fadeIn 0.3s ease-in-out;">
        <div class="text-center space-y-8">
          <!-- Animación de cierre: círculos que se contraen -->
          <div class="relative">
            <div class="w-32 h-32 mx-auto border-4 border-white/30 rounded-full" style="animation: shrinkOut 1s ease-in-out infinite;"></div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 border-4 border-white/50 rounded-full" style="animation: shrinkOut 1s ease-in-out 0.2s infinite;"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-16 h-16 border-4 border-white/70 rounded-full" style="animation: shrinkOut 1s ease-in-out 0.4s infinite;"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
              </svg>
            </div>
          </div>
          <div class="space-y-3">
            <h2 class="text-4xl font-bold text-white drop-shadow-lg">Hasta pronto</h2>
            <p class="text-white/90 text-sm">Cerrando sesión...</p>
            <div class="flex items-center justify-center gap-2 pt-2">
              <div class="w-2 h-2 bg-white rounded-full" style="animation: fadeInOut 1.5s ease-in-out infinite;"></div>
              <div class="w-2 h-2 bg-white rounded-full" style="animation: fadeInOut 1.5s ease-in-out 0.3s infinite;"></div>
              <div class="w-2 h-2 bg-white rounded-full" style="animation: fadeInOut 1.5s ease-in-out 0.6s infinite;"></div>
            </div>
          </div>
        </div>
        <div class="absolute bottom-12 flex flex-col items-center justify-center gap-3">
          <span class="text-white/70 text-[10px] font-medium uppercase tracking-wider">Powered by</span>
          <img src="/logos/aciona-logo.png" alt="Acciona" width="140" height="42" class="object-contain opacity-90 brightness-0 invert" />
        </div>
      </div>
      <style>
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes shrinkOut {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(0.7); opacity: 0.7; }
        }
        @keyframes fadeInOut {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      </style>
    `
    document.body.appendChild(splashDiv)
    
    // Esperar 1 segundo antes de limpiar y redirigir
    setTimeout(() => {
      localStorage.removeItem("user")
      document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      window.location.href = "/"
    }, 1000)
  } else {
    localStorage.removeItem("user")
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
    window.location.href = "/"
  }
}

// Autentica usuario con SQL Server
export async function authenticateUser(usuario: string, contraseña: string): Promise<User | null> {
  try {
    console.log('🔍 Autenticando usuario con consultas SQL reales...')
    const user = await authenticateUserReal(usuario, contraseña)
    if (user) {
      console.log('✅ Autenticación exitosa con SQL real')
      return user
    } else {
      console.log('❌ Usuario no encontrado o credenciales incorrectas')
      return null
    }
  } catch (error) {
    console.error('❌ Error en autenticación SQL:', error)
    return null
  }
}

// Obtiene usuario por ID desde SQL Server
export async function getUserById(id: number): Promise<User | null> {
  try {
    console.log('🔍 Obteniendo usuario por ID con SQL real...')
    const user = await getUserByIdReal(id)
    if (user) {
      console.log('✅ Usuario obtenido con SQL real')
      return user
    } else {
      console.log('❌ Usuario no encontrado por ID')
      return null
    }
  } catch (error) {
    console.error('❌ Error obteniendo usuario con SQL:', error)
    return null
  }
}
