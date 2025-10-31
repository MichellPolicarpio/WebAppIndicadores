-- Script SQL para probar usuario admin
-- Opción 1: Verificar usuarios admin existentes
SELECT 
    ul.id,
    ul.usuario,
    ul.contraseña,
    ul.rolUsuario,
    ru.rolUsuario AS nombreRol,
    ul.nombres,
    ul.apellidoPaterno,
    ul.correo,
    ul.estatusUsuario
FROM UsuariosLecturas ul
LEFT JOIN control_activos.dbo.ROLES_USUARIOS ru ON ru.idRol = ul.rolUsuario
WHERE ul.rolUsuario = 1  -- 1 = ADMINISTRADOR
ORDER BY ul.usuario;

-- ⚠️ IMPORTANTE: Actualizar contraseñas de usuarios admin (que tienen NULL)
-- Ejecuta esto para establecer contraseñas a los usuarios admin existentes:

-- Para usuario 'omarcabra':
UPDATE UsuariosLecturas
SET contraseña = 'admin123'  -- Cambia esta contraseña por la que quieras usar
WHERE usuario = 'omarcabra' AND rolUsuario = 1;

-- Para usuario 'dmartinez':
UPDATE UsuariosLecturas
SET contraseña = 'admin123'  -- Cambia esta contraseña por la que quieras usar
WHERE usuario = 'dmartinez' AND rolUsuario = 1;

-- O actualizar TODOS los usuarios admin de una vez:
UPDATE UsuariosLecturas
SET contraseña = 'admin123'  -- Cambia esta contraseña por la que quieras usar
WHERE rolUsuario = 1 AND (contraseña IS NULL OR contraseña = '');

-- Verificar que se actualizó correctamente:
SELECT usuario, contraseña, rolUsuario 
FROM UsuariosLecturas 
WHERE rolUsuario = 1;

-- Opción 2: Convertir un usuario existente en admin (si ya tiene contraseña)
-- Reemplaza 'TU_USUARIO' con el usuario que quieras convertir en admin
/*
UPDATE UsuariosLecturas
SET rolUsuario = 1  -- 1 = ADMINISTRADOR
WHERE usuario = 'TU_USUARIO';
*/

-- Opción 3: Crear un nuevo usuario admin de prueba (si prefieres)
/*
INSERT INTO UsuariosLecturas 
(usuario, ruta, empresaOperadora, fechaCreacion, rolUsuario, correo, nombres, apellidoPaterno, apellidoMaterno, contraseña, estatusUsuario, idEmpresa_Gerencia)
VALUES 
('admin_test', 1, 1, GETDATE(), 1, 'admin_test@test.com', 'Admin', 'Test', 'Usuario', 'admin123', 1, 1);
*/

-- Opción 4: Verificar qué roles existen
SELECT * FROM control_activos.dbo.ROLES_USUARIOS;
