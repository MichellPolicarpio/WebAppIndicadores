import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, Request } from "tedious";

// Fuerza runtime Node.js (no Edge)
export const config = { runtime: "nodejs" };

function getConfig() {
  const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } = process.env;
  if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
    throw new Error("Variables de entorno de DB incompletas");
  }
  
  // Configuración específica para Azure SQL Database
  return {
    server: DB_SERVER,
    options: {
      database: DB_DATABASE,
      port: parseInt(DB_PORT || "1433", 10),
      encrypt: true,                    // 🔐 OBLIGATORIO para Azure SQL
      trustServerCertificate: false,    // 🔒 NO confiar en certs self-signed
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      // Configuración TLS específica para Azure
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1.2',
        maxVersion: 'TLSv1.3'
      },
      // Configuración adicional para Azure SQL
      useUTC: true,
      abortTransactionOnError: true,
      isolationLevel: 'READ_COMMITTED'
    },
    authentication: {
      type: "default",
      options: {
        userName: DB_USER,
        password: DB_PASSWORD
      }
    }
  };
}

function runQuery<T = any>(sqlText: string): Promise<T[]> {
  const config = getConfig();
  console.log("🔧 Configuración completa:", JSON.stringify(config, null, 2));
  
  const connection = new Connection(config);

  return new Promise((resolve, reject) => {
    const rows: any[] = [];

    connection.on("connect", (err) => {
      if (err) {
        console.error("❌ Error en connect:", err);
        reject(err);
        return;
      }
      console.log("✅ Conexión establecida");

      const request = new Request(sqlText, (err) => {
        if (err) {
          console.error("❌ Error en request:", err);
          reject(err);
        }
      });

      request.on("row", (columns) => {
        const obj: any = {};
        for (const col of columns) obj[col.metadata.colName] = col.value;
        rows.push(obj);
      });

      request.on("requestCompleted", () => {
        console.log("✅ Query completada");
        connection.close();
        resolve(rows);
      });

      connection.execSql(request);
    });

    connection.on("error", (err) => {
      console.error("❌ Error de conexión:", err);
      reject(err);
    });

    console.log("🔄 Intentando conectar...");
    connection.connect();
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Debug: Mostrar configuración completa (sin credenciales)
    const config = getConfig();
    console.log("🔧 Configuración de conexión:", {
      server: config.server,
      database: config.options.database,
      port: config.options.port,
      encrypt: config.options.encrypt,
      trustServerCertificate: config.options.trustServerCertificate,
      enableArithAbort: config.options.enableArithAbort,
      cryptoCredentialsDetails: config.options.cryptoCredentialsDetails
    });

    const rows = await runQuery("SELECT TOP 1 name FROM sys.tables");
    res.status(200).json({ 
      success: true, 
      message: "Conexión exitosa", 
      tables: rows,
      config: {
        server: config.server,
        database: config.options.database,
        encrypt: config.options.encrypt,
        trustServerCertificate: config.options.trustServerCertificate
      }
    });
  } catch (e: any) {
    console.error("❌ Error de conexión:", e);
    console.error("❌ Stack trace:", e.stack);
    res.status(500).json({
      success: false,
      message: "Error de conexión",
      error: e?.message,
      details: { 
        name: e?.name, 
        code: e?.code,
        originalError: e?.originalError
      },
      debug: {
        server: process.env.DB_SERVER,
        database: process.env.DB_DATABASE,
        port: process.env.DB_PORT,
        hasUser: !!process.env.DB_USER,
        hasPassword: !!process.env.DB_PASSWORD,
        config: {
          encrypt: getConfig().options.encrypt,
          trustServerCertificate: getConfig().options.trustServerCertificate
        }
      }
    });
  }
}