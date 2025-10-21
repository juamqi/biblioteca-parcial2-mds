import { db } from "../config/db.js";

export const getLibros = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT l.ISBN, l.titulo, l.autor, e.nombre AS estado
      FROM libro l
      JOIN estadolibro e ON l.idEstadoLibro = e.idEstadoLibro
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addLibro = async (req, res) => {
  try {
    const { ISBN, titulo, autor } = req.body;
    if (!ISBN || !titulo || !autor)
      return res.status(400).json({ mensaje: "Faltan datos del libro" });

    const [estado] = await db.query(
      "SELECT idEstadoLibro FROM estadolibro WHERE nombre = 'DISPONIBLE' LIMIT 1"
    );
    const idEstado = estado[0].idEstadoLibro;

    await db.query(
      "INSERT INTO libro (ISBN, titulo, autor, idEstadoLibro) VALUES (?, ?, ?, ?)",
      [ISBN, titulo, autor, idEstado]
    );

    res.json({ mensaje: "Libro agregado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEstadoLibro = async (req, res) => {
  try {
    const { ISBN } = req.params;
    const { nuevoEstado } = req.body;

    const [estado] = await db.query(
      "SELECT idEstadoLibro FROM estadolibro WHERE nombre = ? LIMIT 1",
      [nuevoEstado]
    );
    if (estado.length === 0)
      return res.status(400).json({ mensaje: "Estado inválido" });

    await db.query("UPDATE libro SET idEstadoLibro = ? WHERE ISBN = ?", [
      estado[0].idEstadoLibro,
      ISBN,
    ]);

    res.json({ mensaje: `Estado del libro actualizado a ${nuevoEstado}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateLibro = async (req, res) => {
  try {
    const { ISBN } = req.params;
    const { titulo, autor } = req.body;

    const [rows] = await db.query("SELECT ISBN FROM libro WHERE ISBN = ?", [ISBN]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "El libro no existe" });

    const fields = [];
    const values = [];
    if (titulo) { fields.push("titulo = ?"); values.push(titulo); }
    if (autor) { fields.push("autor = ?"); values.push(autor); }
    if (fields.length === 0) return res.status(400).json({ mensaje: "No hay datos para actualizar" });

    values.push(ISBN);
    await db.query(`UPDATE libro SET ${fields.join(", ")} WHERE ISBN = ?`, values);
    res.json({ mensaje: "Libro actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteLibro = async (req, res) => {
  try {
    const { ISBN } = req.params;

    const [estado] = await db.query(
      `SELECT e.nombre AS estado FROM libro l
       JOIN estadoLibro e ON l.idEstadoLibro = e.idEstadoLibro
       WHERE l.ISBN = ?`,
      [ISBN]
    );
    if (estado.length === 0) return res.status(404).json({ mensaje: "El libro no existe" });
    if (estado[0].estado === 'PRESTADO') {
      return res.status(400).json({ mensaje: "No se puede eliminar: el libro está prestado" });
    }

    await db.query("DELETE FROM libro WHERE ISBN = ?", [ISBN]);
    res.json({ mensaje: "Libro eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
