import { executeQuery, executeStoredProcedure } from '../database'
import { 
  EmpresaOperadora,
  Gerencia,
  EmpresaGerencia,
  Unidad,
  Variable,
  VariableEmpresaGerencia,
  VariableHechos,
  Usuario,
  CreateVariableHecho,
  UpdateVariableHecho
} from '../models/indicador'

export class IndicadorService {
  // Obtener todas las empresas operadoras
  static async getEmpresasOperadoras(): Promise<EmpresaOperadora[]> {
    try {
      const query = `
        SELECT idEmpresaOperadora, claveEmpresaOperadora, nombreEmpresaOperadora
        FROM EMPRESA_OPERADORA
        ORDER BY nombreEmpresaOperadora
      `
      return await executeQuery(query)
    } catch (error) {
      console.error('Error al obtener empresas operadoras:', error)
      throw error
    }
  }

  // Obtener todas las gerencias
  static async getGerencias(): Promise<Gerencia[]> {
    try {
      const query = `
        SELECT idGerencia, nomGerencia, claveGerencia
        FROM GERENCIAS
        ORDER BY nomGerencia
      `
      return await executeQuery(query)
    } catch (error) {
      console.error('Error al obtener gerencias:', error)
      throw error
    }
  }

  // Obtener empresa-gerencia por empresa
  static async getEmpresaGerenciaByEmpresa(idEmpresa: number): Promise<EmpresaGerencia[]> {
    try {
      const query = `
        SELECT eg.*, eo.nombreEmpresaOperadora, g.nomGerencia
        FROM [INDICADORES].[EMPRESA_GERENCIA] eg
        INNER JOIN EMPRESA_OPERADORA eo ON eg.id_Empresa = eo.idEmpresaOperadora
        INNER JOIN GERENCIAS g ON eg.id_Gerencia = g.idGerencia
        WHERE eg.id_Empresa = @idEmpresa AND eg.activo = 1
        ORDER BY g.nomGerencia
      `
      return await executeQuery(query, [idEmpresa])
    } catch (error) {
      console.error('Error al obtener empresa-gerencia:', error)
      throw error
    }
  }

  // Obtener todas las unidades
  static async getUnidades(): Promise<Unidad[]> {
    try {
      const query = `
        SELECT id_Unidad, nombreUnidad, abreviaturaUnidad, descripcion,
               fecha_Creacion, fecha_Modificacion, creado_Por, modificado_Por
        FROM [INDICADORES].[UNIDAD]
        ORDER BY nombreUnidad
      `
      return await executeQuery(query)
    } catch (error) {
      console.error('Error al obtener unidades:', error)
      throw error
    }
  }

  // Obtener todas las variables
  static async getVariables(): Promise<Variable[]> {
    try {
      const query = `
        SELECT v.*, u.nombreUnidad, u.abreviaturaUnidad
        FROM [INDICADORES].[VARIABLES] v
        INNER JOIN [INDICADORES].[UNIDAD] u ON v.idUnidad = u.id_Unidad
        ORDER BY v.nombreVariable
      `
      return await executeQuery(query)
    } catch (error) {
      console.error('Error al obtener variables:', error)
      throw error
    }
  }

  // Obtener variables por empresa-gerencia
  static async getVariablesByEmpresaGerencia(idEmpresaGerencia: number): Promise<VariableEmpresaGerencia[]> {
    try {
      const query = `
        SELECT veg.*, v.nombreVariable, v.clave_Variable, u.nombreUnidad, u.abreviaturaUnidad
        FROM [INDICADORES].[VARIABLE_EMPRESA_GERENCIA] veg
        INNER JOIN [INDICADORES].[VARIABLES] v ON veg.id_Variable = v.id_Variable
        INNER JOIN [INDICADORES].[UNIDAD] u ON v.idUnidad = u.id_Unidad
        WHERE veg.id_Empresa_Gerencia = @idEmpresaGerencia AND veg.activo = 1
        ORDER BY v.nombreVariable
      `
      return await executeQuery(query, [idEmpresaGerencia])
    } catch (error) {
      console.error('Error al obtener variables por empresa-gerencia:', error)
      throw error
    }
  }

  // Obtener hechos de una variable
  static async getHechosVariable(idVariableEmpresaGerencia: number): Promise<VariableHechos[]> {
    try {
      const query = `
        SELECT *
        FROM [INDICADORES].[VARIABLES_EMPRESA_GERENCIA_HECHOS]
        WHERE id_Variable_Empresa_Gerencia = @idVariableEmpresaGerencia
        ORDER BY periodo DESC
      `
      return await executeQuery(query, [idVariableEmpresaGerencia])
    } catch (error) {
      console.error('Error al obtener hechos de variable:', error)
      throw error
    }
  }

  // Crear nuevo hecho de variable
  static async createVariableHecho(hecho: CreateVariableHecho): Promise<number> {
    try {
      const query = `
        INSERT INTO [INDICADORES].[VARIABLES_EMPRESA_GERENCIA_HECHOS]
        (id_Variable_Empresa_Gerencia, periodo, valor, fecha_Creacion, 
         creado_Por, observaciones_Periodo, validadorDeInsercion)
        VALUES 
        (@id_Variable_Empresa_Gerencia, @periodo, @valor, GETDATE(), 
         @creado_Por, @observaciones_Periodo, @validadorDeInsercion)
        SELECT SCOPE_IDENTITY() as id
      `
      const result = await executeQuery(query, [
        hecho.id_Variable_Empresa_Gerencia,
        hecho.periodo,
        hecho.valor,
        hecho.creado_Por,
        hecho.observaciones_Periodo,
        hecho.validadorDeInsercion
      ])
      return result[0].id
    } catch (error) {
      console.error('Error al crear hecho de variable:', error)
      throw error
    }
  }

  // Actualizar hecho de variable
  static async updateVariableHecho(hecho: UpdateVariableHecho): Promise<boolean> {
    try {
      const query = `
        UPDATE [INDICADORES].[VARIABLES_EMPRESA_GERENCIA_HECHOS]
        SET 
          valor = COALESCE(@valor, valor),
          observaciones_Periodo = COALESCE(@observaciones_Periodo, observaciones_Periodo),
          fecha_Modificacion = GETDATE(),
          modificado_Por = @modificado_Por
        WHERE id_Variable_EmpresaGerencia_Hechos = @id_Variable_EmpresaGerencia_Hechos
      `
      await executeQuery(query, [
        hecho.valor,
        hecho.observaciones_Periodo,
        hecho.modificado_Por,
        hecho.id_Variable_EmpresaGerencia_Hechos
      ])
      return true
    } catch (error) {
      console.error('Error al actualizar hecho de variable:', error)
      throw error
    }
  }

  // Obtener estadísticas por empresa
  static async getEstadisticasByEmpresa(idEmpresa: number): Promise<any> {
    try {
      const query = `
        SELECT 
          COUNT(DISTINCT veg.id_Variable_Empresa_Gerencia) as total_variables,
          COUNT(vh.id_Variable_EmpresaGerencia_Hechos) as total_registros,
          AVG(vh.valor) as promedio_valores,
          MAX(vh.periodo) as ultimo_periodo,
          MIN(vh.periodo) as primer_periodo
        FROM [INDICADORES].[VARIABLE_EMPRESA_GERENCIA] veg
        INNER JOIN [INDICADORES].[EMPRESA_GERENCIA] eg ON veg.id_Empresa_Gerencia = eg.id_Empresa_Gerencia
        LEFT JOIN [INDICADORES].[VARIABLES_EMPRESA_GERENCIA_HECHOS] vh ON veg.id_Variable_Empresa_Gerencia = vh.id_Variable_Empresa_Gerencia
        WHERE eg.id_Empresa = @idEmpresa AND veg.activo = 1
      `
      const result = await executeQuery(query, [idEmpresa])
      return result[0]
    } catch (error) {
      console.error('Error al obtener estadísticas por empresa:', error)
      throw error
    }
  }

  // Obtener dashboard completo con datos
  static async getDashboardData(idEmpresaGerencia: number): Promise<any> {
    try {
      const query = `
        SELECT 
          veg.id_Variable_Empresa_Gerencia,
          v.nombreVariable,
          v.clave_Variable,
          u.nombreUnidad,
          u.abreviaturaUnidad,
          vh.periodo,
          vh.valor,
          vh.observaciones_Periodo,
          vh.fecha_Creacion as fecha_registro
        FROM [INDICADORES].[VARIABLE_EMPRESA_GERENCIA] veg
        INNER JOIN [INDICADORES].[VARIABLES] v ON veg.id_Variable = v.id_Variable
        INNER JOIN [INDICADORES].[UNIDAD] u ON v.idUnidad = u.id_Unidad
        LEFT JOIN [INDICADORES].[VARIABLES_EMPRESA_GERENCIA_HECHOS] vh ON veg.id_Variable_Empresa_Gerencia = vh.id_Variable_Empresa_Gerencia
        WHERE veg.id_Empresa_Gerencia = @idEmpresaGerencia AND veg.activo = 1
        ORDER BY v.nombreVariable, vh.periodo DESC
      `
      return await executeQuery(query, [idEmpresaGerencia])
    } catch (error) {
      console.error('Error al obtener datos del dashboard:', error)
      throw error
    }
  }
}
