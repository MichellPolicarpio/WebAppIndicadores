-- Consulta para verificar campos de auditoría (creado_Por, modificado_Por)
-- en indicadores mensuales de Octubre 2025

SELECT
    vegh.id_Variable_EmpresaGerencia_Hechos,
    vegh.id_Variable_Empresa_Gerencia,
    v.id_Variable,
    v.nombreVariable,
    vegh.periodo,
    vegh.valor,
    vegh.observaciones_Periodo,
    
    -- Campos de auditoría (lo que estamos verificando)
    vegh.creado_Por,
    vegh.fecha_Creacion,
    vegh.modificado_Por,
    vegh.fecha_Modificacion,
    
    -- Información adicional para contexto
    eo.nombreEmpresaOperadora,
    eo.claveEmpresaOperadora,
    g.nomGerencia,
    eg.id_Empresa_Gerencia
    
FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
    ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
INNER JOIN INDICADORES.VARIABLES AS v
    ON v.id_Variable = veg.id_Variable
INNER JOIN INDICADORES.EMPRESA_GERENCIA AS eg
    ON eg.id_Empresa_Gerencia = veg.id_Empresa_Gerencia
INNER JOIN dbo.EMPRESA_OPERADORA AS eo
    ON eo.idEmpresaOperadora = eg.id_Empresa
INNER JOIN dbo.GERENCIAS AS g
    ON g.idGerencia = eg.id_Gerencia
WHERE YEAR(vegh.periodo) = 2025
  AND MONTH(vegh.periodo) = 10  -- Octubre
ORDER BY 
    eo.claveEmpresaOperadora,
    g.nomGerencia,
    v.nombreVariable;

-- Consulta alternativa más simple (solo campos de auditoría)
-- Para verificar rápidamente si hay valores NULL o incorrectos

SELECT
    vegh.id_Variable_EmpresaGerencia_Hechos,
    v.nombreVariable,
    vegh.periodo,
    vegh.creado_Por,
    vegh.fecha_Creacion,
    vegh.modificado_Por,
    vegh.fecha_Modificacion,
    CASE 
        WHEN vegh.creado_Por IS NULL THEN '❌ NULL'
        WHEN vegh.creado_Por = 'Usuario' THEN '⚠️ Valor fijo incorrecto'
        ELSE '✅ OK'
    END AS estado_creado_Por,
    CASE 
        WHEN vegh.modificado_Por IS NULL AND vegh.fecha_Modificacion IS NULL THEN '✅ Sin modificar (normal)'
        WHEN vegh.modificado_Por IS NOT NULL THEN '✅ OK'
        WHEN vegh.modificado_Por IS NULL AND vegh.fecha_Modificacion IS NOT NULL THEN '❌ NULL pero tiene fecha modificación'
        ELSE '✅ OK'
    END AS estado_modificado_Por
FROM INDICADORES.VARIABLES_EMPRESA_GERENCIA_HECHOS AS vegh
INNER JOIN INDICADORES.VARIABLE_EMPRESA_GERENCIA AS veg
    ON veg.id_Variable_Empresa_Gerencia = vegh.id_Variable_Empresa_Gerencia
INNER JOIN INDICADORES.VARIABLES AS v
    ON v.id_Variable = veg.id_Variable
WHERE YEAR(vegh.periodo) = 2025
  AND MONTH(vegh.periodo) = 10
ORDER BY vegh.fecha_Creacion DESC;

