import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, Request } from "tedious";

// Fuerza runtime Node.js (no Edge)
export const config = { runtime: "nodejs" };

function getConfig() {
  const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } = process.env;
  if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
    throw new Error("Variables de entorno de DB incompletas");
  }
  return {
    server: DB_SERVER, // p.ej. gmas.database.windows.net
    options: {
      database: DB_DATABASE,
      port: parseInt(DB_PORT || "1433", 10),
      encrypt: true,                // 🔐 Requerido por Azure SQL
      trustServerCertificate: false, // 🔒 NO confiar en certs self-signed
      enableArithAbort: true,
      connectionTimeout: 30000,
      requestTimeout: 30000,
      // Configuración específica para Azure SQL
      cryptoCredentialsDetails: {
        minVersion: 'TLSv1.2'
      }
    },
    authentication: {
      type: "default",
      options: {
        userName: DB_USER,          // "mapm"
        password: DB_PASSWORD       // "62762002Mp#"
      }
    }
  };
}

function runQuery<T = any>(sqlText: string): Promise<T[]> {
  const connection = new Connection(getConfig());

  return new Promise((resolve, reject) => {
    const rows: any[] = [];

    connection.on("connect", (err) => {
      if (err) {
        reject(err);
        return;
      }

      const request = new Request(sqlText, (err) => {
        if (err) reject(err);
      });

      request.on("row", (columns) => {
        const obj: any = {};
        for (const col of columns) obj[col.metadata.colName] = col.value;
        rows.push(obj);
      });

      request.on("requestCompleted", () => {
        connection.close();
        resolve(rows);
      });

      connection.execSql(request);
    });

    connection.on("error", (err) => {
      reject(err);
    });

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