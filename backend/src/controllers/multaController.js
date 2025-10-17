import { db } from "../config/db.js";

export const getMultas = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.idMulta, m.nroSocio, s.nombre AS nombreSocio,
             m.idPrestamo, m.monto, m.motivo, m.fecha, m.pagada,
             l.titulo AS libroTitulo
      FROM multa m
      JOIN socio s ON m.nroSocio = s.nroSocio
      JOIN prestamo p ON m.idPrestamo = p.idPrestamo
      JOIN libro l ON p.ISBN = l.ISBN
      ORDER BY m.fecha DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMultasPendientes = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT m.idMulta, m.nroSocio, s.nombre AS nombreSocio,
             m.idPrestamo, m.monto, m.motivo, m.fecha,
             l.titulo AS libroTitulo
      FROM multa m
      JOIN socio s ON m.nroSocio = s.nroSocio
      JOIN prestamo p ON m.idPrestamo = p.idPrestamo
      JOIN libro l ON p.ISBN = l.ISBN
      WHERE m.pagada = FALSE
      ORDER BY m.fecha ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMultasPorSocio = async (req, res) => {
  try {
    const { nroSocio } = req.params;
    const [rows] = await db.query(`
      SELECT m.idMulta, m.idPrestamo, m.monto, m.motivo, m.fecha, m.pagada,
             l.titulo AS libroTitulo
      FROM multa m
      JOIN prestamo p ON m.idPrestamo = p.idPrestamo
      JOIN libro l ON p.ISBN = l.ISBN
      WHERE m.nroSocio = ?
      ORDER BY m.fecha DESC
    `, [nroSocio]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const pagarMulta = async (req, res) => {
  try {
    const { idMulta } = req.params;

    const [multa] = await db.query(
      "SELECT idMulta, pagada FROM multa WHERE idMulta = ?",
      [idMulta]
    );

    if (multa.length === 0) {
      return res.status(404).json({ mensaje: "La multa no existe" });
    }

    if (multa[0].pagada) {
      return res.status(400).json({ mensaje: "La multa ya fue pagada" });
    }

    await db.query(
      "UPDATE multa SET pagada = TRUE WHERE idMulta = ?",
      [idMulta]
    );

    res.json({ mensaje: "Multa pagada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};