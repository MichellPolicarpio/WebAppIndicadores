import sql from "mssql";

// Fuerza runtime Node.js (no Edge)
export const runtime = "nodejs";

function connStr() {
  const { DB_SERVER, DB_DATABASE, DB_USER, DB_PASSWORD, DB_PORT } = process.env;
  if (!DB_SERVER || !DB_DATABASE || !DB_USER || !DB_PASSWORD) {
    throw new Error("Variables de entorno de DB incompletas");
  }
  const port = DB_PORT || "1433";
  return `Server=${DB_SERVER},${port};Database=${DB_DATABASE};User Id=${DB_USER};Password=${DB_PASSWORD};Encrypt=true;TrustServerCertificate=false;`;
}

export async function GET() {
  try {
    try { await sql.close(); } catch {}

    const pool = await sql.connect({
      connectionString: connStr(),
      driver: "tedious",
      options: { encrypt: true, trustServerCertificate: false },
    });

    const r = await pool.request().query("SELECT TOP 1 name FROM sys.tables");
    await sql.close();

    return new Response(JSON.stringify({ success: true, message: "Conexión exitosa", tables: r.recordset }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({
      success: false,
      message: "Error de conexión",
      error: e?.message,
      details: { code: e?.code, name: e?.name },
    }), { status: 500, headers: { "content-type": "application/json" } });
  }
}