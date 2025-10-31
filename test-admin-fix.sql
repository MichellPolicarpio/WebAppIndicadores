-- Script para diagnosticar y corregir problemas de login con usuarios admin

-- 1. Verificar estado actual de los usuarios admin
SELECT 
    ul.id,
    ul.usuario,
    ul.contraseña,
    ul.rolUsuario,
    ul.idEmpresa_Gerencia,
    ul.empresaOperadora,
    ul.estatusUsuario,
    CASE 
        WHEN ul.idEmpresa_Gerencia IS NULL THEN '❌ idEmpresa_Gerencia es NULL'
        WHEN NOT EXISTS (SELECT 1 FROM INDICADORES.EMPRESA_GERENCIA eg WHERE eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia) THEN '❌ idEmpresa_Gerencia no existe en EMPRESA_GERENCIA'
        ELSE '✅ OK'
    END AS estado_gerencia,
    CASE 
        WHEN ul.contraseña IS NULL OR ul.contraseña = '' THEN '❌ Contraseña vacía'
        ELSE '✅ OK'
    END AS estado_password,
    CASE 
        WHEN ul.estatusUsuario != 1 THEN '❌ Usuario inactivo'
        ELSE '✅ OK'
    END AS estado_activo
FROM UsuariosLecturas ul
WHERE ul.rolUsuario = 1
ORDER BY ul.usuario;

-- 2. Ver qué idEmpresa_Gerencia existen y están disponibles
SELECT TOP 5
    eg.id_Empresa_Gerencia,
    eg.clave_Empresa_Gerencia,
    eo.nombreEmpresaOperadora,
    g.nomGerencia
FROM INDICADORES.EMPRESA_GERENCIA eg
INNER JOIN EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
INNER JOIN GERENCIAS g ON g.idGerencia = eg.id_Gerencia
ORDER BY eg.id_Empresa_Gerencia;

-- 3. CORREGIR usuarios admin (ejecuta esto después de ver el resultado del paso 1)
-- Reemplaza los valores según lo que encuentres en el paso 1 y 2

-- Opción A: Si los usuarios NO tienen idEmpresa_Gerencia, asigna uno válido
-- (Reemplaza 1 con un id_Empresa_Gerencia válido del paso 2)
/*
UPDATE UsuariosLecturas
SET 
    idEmpresa_Gerencia = 1,  -- Reemplaza con un id válido
    empresaOperadora = 1,   -- Reemplaza con el id de empresa correspondiente
    estatusUsuario = 1,      -- Asegurar que esté activo
    contraseña = 'admin123'
WHERE usuario IN ('omarcabra', 'dmartinez')
  AND rolUsuario = 1;
*/

-- Opción B: Si los usuarios tienen idEmpresa_Gerencia pero no coincide con las tablas relacionadas
-- Primero verifica qué tienen:
/*
SELECT ul.usuario, ul.idEmpresa_Gerencia, 
       CASE WHEN eg.id_Empresa_Gerencia IS NULL THEN 'No existe' ELSE 'Existe' END AS existe_en_gerencia
FROM UsuariosLecturas ul
LEFT JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia
WHERE ul.usuario IN ('omarcabra', 'dmartinez');
*/

-- 4. SOLUCIÓN COMPLETA: Asignar todos los campos necesarios a los usuarios admin
-- (Ajusta los valores según tu estructura de BD)
UPDATE UsuariosLecturas
SET 
    idEmpresa_Gerencia = (SELECT TOP 1 id_Empresa_Gerencia FROM INDICADORES.EMPRESA_GERENCIA ORDER BY id_Empresa_Gerencia),  -- Primer id disponible
    empresaOperadora = 1,   -- Ajusta según tu necesidad
    estatusUsuario = 1,    -- Activo
    contraseña = 'admin123' -- Cambia si quieres otra contraseña
WHERE usuario IN ('omarcabra', 'dmartinez')
  AND rolUsuario = 1;

-- 5. Verificar que todo quedó correcto
SELECT 
    ul.usuario,
    ul.contraseña,
    ul.rolUsuario,
    ul.idEmpresa_Gerencia,
    ul.estatusUsuario,
    eg.id_Empresa_Gerencia AS existe_gerencia,
    eo.nombreEmpresaOperadora,
    g.nomGerencia,
    ru.rolUsuario AS nombre_rol
FROM UsuariosLecturas ul
LEFT JOIN INDICADORES.EMPRESA_GERENCIA eg ON eg.id_Empresa_Gerencia = ul.idEmpresa_Gerencia
LEFT JOIN EMPRESA_OPERADORA eo ON eo.idEmpresaOperadora = eg.id_Empresa
LEFT JOIN GERENCIAS g ON g.idGerencia = eg.id_Gerencia
LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
WHERE ul.usuario IN ('omarcabra', 'dmartinez')
  AND ul.rolUsuario = 1;

