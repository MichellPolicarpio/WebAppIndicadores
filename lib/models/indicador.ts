// Modelo para Empresa Operadora
export interface EmpresaOperadora {
  idEmpresaOperadora: number
  claveEmpresaOperadora: string
  nombreEmpresaOperadora: string
}

// Modelo para Gerencias
export interface Gerencia {
  idGerencia: number
  nomGerencia: string
  claveGerencia: string
}

// Modelo para Empresa-Gerencia
export interface EmpresaGerencia {
  id_Empresa_Gerencia: number
  id_Empresa: number
  id_Gerencia: number
  clave_Empresa_Gerencia: string
  observciones: string
  fecha_Creacion: Date
  fecha_Modificacion: Date
  creado_Por: string
  modificado_Por: string
  activo: boolean
}

// Modelo para Unidades
export interface Unidad {
  id_Unidad: number
  nombreUnidad: string
  abreviaturaUnidad: string
  descripcion: string
  fecha_Creacion: Date
  fecha_Modificacion: Date
  creado_Por: string
  modificado_Por: string
}

// Modelo para Variables
export interface Variable {
  id_Variable: number
  clave_Variable: string
  nombreVariable: string
  observaciones: string
  fecha_Creacion: Date
  fecha_Modificacion: Date
  creado_Por: string
  modificado_Por: string
  idUnidad: number
}

// Modelo para Variable-Empresa-Gerencia
export interface VariableEmpresaGerencia {
  id_Variable_Empresa_Gerencia: number
  id_Empresa_Gerencia: number
  clave_Variable_Empresa_Gerencia: string
  fecha_Creacion: Date
  fecha_Modificacion: Date
  creado_Por: string
  modificado_Por: string
  activo: boolean
  id_Variable: number
  carga_Automatica: boolean
}

// Modelo para Hechos de Variables
export interface VariableHechos {
  id_Variable_EmpresaGerencia_Hechos: number
  id_Variable_Empresa_Gerencia: number
  periodo: Date
  valor: number
  fecha_Creacion: Date
  fecha_Modificacion: Date
  creado_Por: string
  modificado_Por: string
  observaciones_Periodo: string
  validadorDeInsercion: string
}

// Modelo para Usuarios
export interface Usuario {
  id: number
  usuario: string
  contraseña: string
  ruta: number
  empresaOperadora: number
  fechaCreacion: Date
  fechaBaja: Date
  estatusUsuario: number
  rolUsuario: number
  correo: string
  nombres: string
  apellidoPaterno: string
  apellidoMaterno: string
  fechaModificacionpPass: Date
  idEmpresa_Gerencia: number
}

// Modelo para crear nuevo hecho
export interface CreateVariableHecho {
  id_Variable_Empresa_Gerencia: number
  periodo: Date
  valor: number
  creado_Por: string
  observaciones_Periodo?: string
  validadorDeInsercion?: string
}

// Modelo para actualizar hecho
export interface UpdateVariableHecho {
  id_Variable_EmpresaGerencia_Hechos: number
  valor?: number
  observaciones_Periodo?: string
  modificado_Por: string
}
