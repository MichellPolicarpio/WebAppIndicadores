import { authenticateUserReal, getUserByIdReal } from './auth-real'
import { authenticateUserSimple, getUserByIdSimple } from './auth-simple'

export interface User {
  id: number
  usuario: string
  correo: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  empresaOperadora: number
  idEmpresa_Gerencia: number
  estatusUsuario: number
  rolUsuario: number
  // Campos adicionales para compatibilidad
  email: string
  company: string
  companyFull?: string
  gerencia: string
  name: string
}

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

export function logout() {
  localStorage.removeItem("user")
  window.location.href = "/"
}

// Función para autenticar usuario (SOLO consultas SQL reales)
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

// Función para obtener usuario por ID (SOLO consultas SQL reales)
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
