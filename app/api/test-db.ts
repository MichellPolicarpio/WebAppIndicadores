import sql from "mssql";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Validar variables de entorno
    if (!process.env.DB_SERVER || !process.env.DB_DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD || !process.env.DB_PORT) {
      return res.status(500).json({ ok: false, error: "Variables de entorno de base de datos no configuradas" });
    }

    const pool = await sql.connect({
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
      options: { encrypt: true },
    });
    
    const result = await pool.request().query("SELECT TOP 1 name FROM sys.tables");
    await pool.close();
    
    res.status(200).json({ ok: true, tables: result.recordset });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Error desconocido";
    res.status(500).json({ ok: false, error: errorMessage });
  }
}