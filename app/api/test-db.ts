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
      trustServerCertificate: false // 🔒 NO confiar en certs self-signed
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
    const rows = await runQuery("SELECT TOP 1 name FROM sys.tables");
    res.status(200).json({ success: true, message: "Conexión exitosa", tables: rows });
  } catch (e: any) {
    res.status(500).json({
      success: false,
      message: "Error de conexión",
      error: e?.message,
      details: { name: e?.name, code: e?.code }
    });
  }
}