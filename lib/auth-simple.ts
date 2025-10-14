// Sistema de autenticación simple que no depende de SQL Server
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
  gerencia: string
  name: string
}

import { env } from './env'

// Datos de usuarios que conocemos de la base de datos
// En producción, estos datos vendrían de la base de datos
const USERS_DATA = [
  {
    id: 1,
    usuario: 'NadiaP',
    correo: null,
    nombres: null,
    apellidoPaterno: null,
    apellidoMaterno: null,
    empresaOperadora: 1,
    idEmpresa_Gerencia: 1,
    estatusUsuario: 1,
    rolUsuario: 1,
    contraseña: process.env.DEFAULT_USER_PASSWORD || '1234',
    // Campos para compatibilidad
    email: 'nadia@empresa.com',
    company: 'GMas',
    gerencia: 'Operaciones',
    name: 'Nadia Portugal'
  }
]

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

// Función para autenticar usuario con datos locales
export async function authenticateUserSimple(usuario: string, contraseña: string): Promise<User | null> {
  try {
    // Buscar usuario en los datos locales
    const userData = USERS_DATA.find(u => u.usuario === usuario && u.contraseña === contraseña && u.estatusUsuario === 1)
    
    if (!userData) {
      return null
    }
    
    // Crear objeto User sin contraseña
    const { contraseña: _, ...userWithoutPassword } = userData
    
    return userWithoutPassword as User
  } catch (error) {
    console.error('Error al autenticar usuario:', error)
    return null
  }
}

// Función para obtener usuario por ID
export async function getUserByIdSimple(id: number): Promise<User | null> {
  try {
    const userData = USERS_DATA.find(u => u.id === id && u.estatusUsuario === 1)
    
    if (!userData) {
      return null
    }
    
    const { contraseña: _, ...userWithoutPassword } = userData
    return userWithoutPassword as User
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error)
    return null
  }
}
