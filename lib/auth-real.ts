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
    
    // Consulta SQL (filtrada por usuario y contraseña)
    // NOTA: Usa LEFT JOINs para permitir usuarios admin sin idEmpresa_Gerencia
    const query = `
      SELECT 
        ul.id,
        ul.idEmpresa_Gerencia,
        ul.usuario,
        ul.contraseña AS contrasena,
        ul.rolUsuario AS rolUsuario,
        ru.rolUsuario AS rolNombre,
        ul.correo,
        ul.empresaOperadora,
        ul.estatusUsuario,
        ul.nombres,
        ul.apellidoPaterno,
        ul.apellidoMaterno,
        eo.claveEmpresaOperadora,
        eo.nombreEmpresaOperadora,
        eg.id_Gerencia,
        eg.clave_Empresa_Gerencia,
        g.nomGerencia
      FROM UsuariosLecturas ul
      LEFT JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia
      LEFT JOIN EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
      LEFT JOIN GERENCIAS g ON g.idGerencia = eg.id_Gerencia
      LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
      WHERE ul.usuario = @usuario
        AND ul.contraseña = @contraseña
        AND (ul.idEmpresa_Gerencia IS NOT NULL OR ul.rolUsuario = 1)
    `
    
    console.log('📝 Ejecutando consulta SQL:', query)
    console.log('🔑 Parámetros:', { usuario, contraseña: '***' })
    
    const result = await executeQuery(query, [usuario, contraseña])
    
    if (result && result.length > 0) {
      const userData = result[0]
      console.log('✅ Usuario encontrado en BD:', userData.usuario)
      
      // Normalizar compañía a valores esperados por la UI ("GMas" | "CAB")
      // Para usuarios admin sin idEmpresa_Gerencia, usar valores por defecto
      const rawClave = (userData.claveEmpresaOperadora || '').toString().toUpperCase()
      const rawNombre = (userData.nombreEmpresaOperadora || '').toString().toUpperCase()
      const empresaId = Number(userData.empresaOperadora) || (userData.rolUsuario === 1 ? 1 : null)
      let companyNormalized: 'GMas' | 'CAB'
      
      // Si es admin sin empresa asociada, usar GMas por defecto
      if (userData.rolUsuario === 1 && !userData.idEmpresa_Gerencia) {
        companyNormalized = 'GMas'
      } else if (rawClave.includes('CAB') || rawNombre.includes('CAB') || empresaId === 2) {
        companyNormalized = 'CAB'
      } else if (rawClave.includes('GMAS') || rawNombre.includes('GMAS') || empresaId === 1) {
        companyNormalized = 'GMas'
      } else {
        // Fallback: si no se pudo inferir por texto, usar empresaOperadora o default
        companyNormalized = empresaId === 1 ? 'GMas' : (empresaId === 2 ? 'CAB' : 'GMas')
      }

      // Nombre completo de empresa derivado del id (prioritario) y como fallback el de la BD
      // Para admins sin empresa, usar el nombre por defecto
      const companyFullDerived = empresaId === 1
        ? 'GRUPO METROPOLITANO DE AGUA Y SANEAMIENTO'
        : empresaId === 2
        ? 'COMPAÑÍA DE AGUA DE BOCA DEL RÍO'
        : (userData.nombreEmpresaOperadora || (userData.rolUsuario === 1 ? 'SISTEMA ADMINISTRATIVO' : ''))

      // Crear objeto User con datos de la base de datos (usando los joins)
      // Para admins sin idEmpresa_Gerencia, usar valores por defecto
      const user: User = {
        id: userData.id,
        usuario: userData.usuario,
        correo: userData.correo || '',
        nombres: userData.nombres || '',
        apellidoPaterno: userData.apellidoPaterno || '',
        apellidoMaterno: userData.apellidoMaterno || '',
        empresaOperadora: userData.empresaOperadora || (userData.rolUsuario === 1 ? 1 : null),
        idEmpresa_Gerencia: userData.idEmpresa_Gerencia || (userData.rolUsuario === 1 ? null : undefined),
        estatusUsuario: userData.estatusUsuario || (userData.rolUsuario === 1 ? 1 : 0), // Admins se consideran activos por defecto
        rolUsuario: userData.rolUsuario,
        // Campos para compatibilidad
        email: (userData.correo && userData.correo !== 'NULL') ? userData.correo : '',
        company: companyNormalized,
        companyFull: companyFullDerived,
        gerencia: userData.nomGerencia || (userData.rolUsuario === 1 ? 'Administración' : ''),
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
