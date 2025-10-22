import type { NextApiRequest, NextApiResponse } from "next";
import sql from "mssql";

// 🔧 Forzar runtime Node.js (no Edge)
export const config = { runtime: "nodejs" };

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validar variables de entorno
    if (
      !process.env.DB_SERVER ||
      !process.env.DB_DATABASE ||
      !process.env.DB_USER ||
      !process.env.DB_PASSWORD ||
      !process.env.DB_PORT
    ) {
      return res.status(500).json({
        success: false,
        message: "Variables de entorno de base de datos no configuradas",
      });
    }

    // Configuración de conexión a Azure SQL
    const dbConfig: sql.config = {
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || "1433", 10),
      encrypt: true, // Asegura encriptación TLS
      options: {
        encrypt: true,               // Obligatorio para Azure SQL
        trustServerCertificate: false, // No confiar en certificados autofirmados
      },
      pool: {
        max: 5,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    // Conexión y prueba de consulta
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT TOP 1 name FROM sys.tables");
    await pool.close();

    res.status(200).json({
      success: true,
      message: "Conexión exitosa a la base de datos",
      tables: result.recordset,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: "Error de conexión",
      error: err.message,
      details: { code: err.code, name: err.name },
    });
  }
}