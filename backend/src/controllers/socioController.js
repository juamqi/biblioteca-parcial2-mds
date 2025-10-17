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