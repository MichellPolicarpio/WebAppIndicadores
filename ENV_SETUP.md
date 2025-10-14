# Configuración de Variables de Entorno

## 📋 Variables Requeridas

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```env
# Configuración de Base de Datos SQL Server
DB_SERVER=localhost
DB_DATABASE=control_activos
DB_USER=sa
DB_PASSWORD=tu_contraseña_real_aqui
DB_PORT=1433

# Configuración de la aplicación
NEXT_PUBLIC_APP_NAME=SIVEG
NEXT_PUBLIC_APP_VERSION=1.0.0

# Configuración de autenticación
AUTH_SECRET=tu-clave-secreta-muy-segura
NEXTAUTH_URL=http://localhost:3000

# Contraseña por defecto para usuarios de prueba
DEFAULT_USER_PASSWORD=1234
```

## 🔧 Configuración por Entorno

### Desarrollo Local
```env
DB_SERVER=localhost
DB_DATABASE=control_activos
DB_USER=sa
DB_PASSWORD=Passw0rd!
```

### Producción
```env
DB_SERVER=tu-servidor-produccion
DB_DATABASE=control_activos
DB_USER=usuario_produccion
DB_PASSWORD=contraseña_super_segura
```

## 🛡️ Seguridad

- **NUNCA** subas el archivo `.env.local` al repositorio
- Usa contraseñas seguras en producción
- Cambia `AUTH_SECRET` por una clave única y segura
- Considera usar Azure Key Vault o AWS Secrets Manager en producción

## 📝 Notas

- El archivo `.env.local` se carga automáticamente en Next.js
- Las variables que empiezan con `NEXT_PUBLIC_` están disponibles en el cliente
- Las demás variables solo están disponibles en el servidor
