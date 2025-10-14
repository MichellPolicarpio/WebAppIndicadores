// Sistema de autenticación con consultas SQL reales
import { executeQuery } from './database'

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

// Función para autenticar usuario con consulta SQL real
export async function authenticateUserReal(usuario: string, contraseña: string): Promise<User | null> {
  try {
    console.log('🔍 Autenticando usuario con consulta SQL real:', usuario)
    
    // Consulta SQL para autenticar usuario (sin restricción de estatus por ahora)
    const query = `
      SELECT 
        id, 
        usuario, 
        correo, 
        nombres, 
        apellidoPaterno, 
        apellidoMaterno,
        empresaOperadora,
        idEmpresa_Gerencia,
        estatusUsuario,
        rolUsuario
      FROM UsuariosLecturas 
      WHERE usuario = @usuario 
        AND contraseña = @contraseña
    `
    
    console.log('📝 Ejecutando consulta SQL:', query)
    console.log('🔑 Parámetros:', { usuario, contraseña: '***' })
    
    const result = await executeQuery(query, [usuario, contraseña])
    
    if (result && result.length > 0) {
      const userData = result[0]
      console.log('✅ Usuario encontrado en BD:', userData.usuario)
      
      // Crear objeto User con datos de la base de datos
      const user: User = {
        id: userData.id,
        usuario: userData.usuario,
        correo: userData.correo || '',
        nombres: userData.nombres || '',
        apellidoPaterno: userData.apellidoPaterno || '',
        apellidoMaterno: userData.apellidoMaterno || '',
        empresaOperadora: userData.empresaOperadora,
        idEmpresa_Gerencia: userData.idEmpresa_Gerencia,
        estatusUsuario: userData.estatusUsuario,
        rolUsuario: userData.rolUsuario,
        // Campos para compatibilidad
        email: userData.correo || '',
        company: userData.empresaOperadora === 1 ? 'GMas' : 'CAB',
        gerencia: userData.idEmpresa_Gerencia === 1 ? 'Operaciones' : 'Administración',
        name: `${userData.nombres || ''} ${userData.apellidoPaterno || ''}`.trim()
      }
      
      console.log('✅ Usuario autenticado exitosamente:', user.usuario)
      return user
    } else {
      console.log('❌ Usuario no encontrado o credenciales incorrectas')
      return null
    }
  } catch (error) {
    console.error('❌ Error al autenticar usuario con SQL:', error)
    return null
  }
}

// Función para obtener usuario por ID con consulta SQL real
export async function getUserByIdReal(id: number): Promise<User | null> {
  try {
    console.log('🔍 Obteniendo usuario por ID con consulta SQL real:', id)
    
    const query = `
      SELECT 
        id, 
        usuario, 
        correo, 
        nombres, 
        apellidoPaterno, 
        apellidoMaterno,
        empresaOperadora,
        idEmpresa_Gerencia,
        estatusUsuario,
        rolUsuario
      FROM UsuariosLecturas 
      WHERE id = @id 
        AND estatusUsuario = 1
    `
    
    const result = await executeQuery(query, [id])
    
    if (result && result.length > 0) {
      const userData = result[0]
      console.log('✅ Usuario encontrado por ID:', userData.usuario)
      
      const user: User = {
        id: userData.id,
        usuario: userData.usuario,
        correo: userData.correo || '',
        nombres: userData.nombres || '',
        apellidoPaterno: userData.apellidoPaterno || '',
        apellidoMaterno: userData.apellidoMaterno || '',
        empresaOperadora: userData.empresaOperadora,
        idEmpresa_Gerencia: userData.idEmpresa_Gerencia,
        estatusUsuario: userData.estatusUsuario,
        rolUsuario: userData.rolUsuario,
        // Campos para compatibilidad
        email: userData.correo || '',
        company: userData.empresaOperadora === 1 ? 'GMas' : 'CAB',
        gerencia: userData.idEmpresa_Gerencia === 1 ? 'Operaciones' : 'Administración',
        name: `${userData.nombres || ''} ${userData.apellidoPaterno || ''}`.trim()
      }
      
      return user
    } else {
      console.log('❌ Usuario no encontrado por ID')
      return null
    }
  } catch (error) {
    console.error('❌ Error al obtener usuario por ID con SQL:', error)
    return null
  }
}
