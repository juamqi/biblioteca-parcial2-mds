import { db } from "../config/db.js";

export const getSocios = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM socio");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addSocio = async (req, res) => {
  try {
    const { dni, nombre } = req.body;

    if (!dni || !nombre) {
      return res.status(400).json({ mensaje: "Faltan datos del socio" });
    }

    await db.query("INSERT INTO socio (dni, nombre) VALUES (?, ?)", [dni, nombre]);
    res.json({ mensaje: "Socio agregado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSocio = async (req, res) => {
  try {
    const { nroSocio } = req.params;
    const { dni, nombre } = req.body;

    const [rows] = await db.query("SELECT * FROM socio WHERE nroSocio = ?", [nroSocio]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "El socio no existe" });

    const fields = [];
    const values = [];
    if (dni) { fields.push("dni = ?"); values.push(dni); }
    if (nombre) { fields.push("nombre = ?"); values.push(nombre); }
    if (fields.length === 0) return res.status(400).json({ mensaje: "No hay datos para actualizar" });

    values.push(nroSocio);
    await db.query(`UPDATE socio SET ${fields.join(", ")} WHERE nroSocio = ?`, values);
    res.json({ mensaje: "Socio actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteSocio = async (req, res) => {
  try {
    const { nroSocio } = req.params;

    const [activos] = await db.query(
      `SELECT COUNT(*) AS c FROM prestamo p
       JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
       WHERE p.nroSocio = ? AND ep.nombre = 'ACTIVO'`,
      [nroSocio]
    );
    if (activos[0].c > 0) {
      return res.status(400).json({ mensaje: "No se puede eliminar: el socio tiene préstamos activos" });
    }

    const [exists] = await db.query("SELECT nroSocio FROM socio WHERE nroSocio = ?", [nroSocio]);
    if (exists.length === 0) return res.status(404).json({ mensaje: "El socio no existe" });

    await db.query("DELETE FROM socio WHERE nroSocio = ?", [nroSocio]);
    res.json({ mensaje: "Socio eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};