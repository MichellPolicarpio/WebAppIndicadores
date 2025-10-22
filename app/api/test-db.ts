import sql from "mssql";

export default async function handler(req, res) {
  try {
    const pool = await sql.connect({
      server: process.env.DB_SERVER,
      database: process.env.DB_DATABASE,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
      options: { encrypt: true },
    });
    const result = await pool.request().query("SELECT TOP 1 name FROM sys.tables");
    res.status(200).json({ ok: true, tables: result.recordset });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}