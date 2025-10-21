import { db } from "../config/db.js";

export const getPrestamos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.idPrestamo, p.nroSocio, s.nombre AS nombreSocio, 
             p.ISBN, l.titulo, l.autor,
             p.fechaInicio, p.fechaDevolucionEsperada, p.fechaDevolucionReal,
             ep.nombre AS estado
      FROM prestamo p
      JOIN socio s ON p.nroSocio = s.nroSocio
      JOIN libro l ON p.ISBN = l.ISBN
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      ORDER BY p.fechaInicio DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrestamosActivos = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.idPrestamo, p.nroSocio, s.nombre AS nombreSocio, 
             p.ISBN, l.titulo, l.autor,
             p.fechaInicio, p.fechaDevolucionEsperada,
             ep.nombre AS estado
      FROM prestamo p
      JOIN socio s ON p.nroSocio = s.nroSocio
      JOIN libro l ON p.ISBN = l.ISBN
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      WHERE ep.nombre = 'ACTIVO'
      ORDER BY p.fechaDevolucionEsperada ASC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPrestamosPorSocio = async (req, res) => {
  try {
    const { nroSocio } = req.params;
    const [rows] = await db.query(`
      SELECT p.idPrestamo, p.ISBN, l.titulo, l.autor,
             p.fechaInicio, p.fechaDevolucionEsperada, p.fechaDevolucionReal,
             ep.nombre AS estado
      FROM prestamo p
      JOIN libro l ON p.ISBN = l.ISBN
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      WHERE p.nroSocio = ?
      ORDER BY p.fechaInicio DESC
    `, [nroSocio]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addPrestamo = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { nroSocio, ISBN, diasPrestamo = 14 } = req.body;

    if (!nroSocio || !ISBN) {
      return res.status(400).json({ mensaje: "Faltan datos del préstamo" });
    }

    const [socio] = await connection.query(
      "SELECT nroSocio FROM socio WHERE nroSocio = ?",
      [nroSocio]
    );
    if (socio.length === 0) {
      return res.status(404).json({ mensaje: "El socio no existe" });
    }

    const [libro] = await connection.query(`
      SELECT l.ISBN, l.titulo, e.nombre AS estado
      FROM libro l
      JOIN estadoLibro e ON l.idEstadoLibro = e.idEstadoLibro
      WHERE l.ISBN = ?
    `, [ISBN]);

    if (libro.length === 0) {
      return res.status(404).json({ mensaje: "El libro no existe" });
    }

    const estadoLibroActual = String(libro[0].estado || "").toUpperCase();
    if (estadoLibroActual !== "DISPONIBLE") {
      return res.status(400).json({
        mensaje: `El libro "${libro[0].titulo}" no está disponible. Estado actual: ${libro[0].estado}`
      });
    }

    const [estadoPrestado] = await connection.query(
      "SELECT idEstadoLibro FROM estadoLibro WHERE nombre = 'PRESTADO'"
    );
    const [estadoActivo] = await connection.query(
      "SELECT idEstadoPrestamo FROM estadoPrestamo WHERE nombre = 'ACTIVO'"
    );

    const fechaInicio = new Date();
    const fechaDevolucion = new Date();
    fechaDevolucion.setDate(fechaDevolucion.getDate() + diasPrestamo);

    const [result] = await connection.query(
      `INSERT INTO prestamo (nroSocio, ISBN, fechaInicio, fechaDevolucionEsperada, idEstadoPrestamo) VALUES (?, ?, ?, ?, ?)`,
      [
        nroSocio,
        ISBN,
        fechaInicio.toISOString().split('T')[0],
        fechaDevolucion.toISOString().split('T')[0],
        estadoActivo[0].idEstadoPrestamo
      ]
    );
    const idPrestamo = result.insertId;

    await connection.query(
      "UPDATE libro SET idEstadoLibro = ? WHERE ISBN = ?",
      [estadoPrestado[0].idEstadoLibro, ISBN]
    );

    await connection.commit();

    res.json({
      mensaje: "Préstamo registrado correctamente",
      idPrestamo,
      fechaDevolucionEsperada: fechaDevolucion.toISOString().split('T')[0]
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

export const devolverLibro = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { idPrestamo } = req.params;
    const { libroDaniado = false, montoMulta = 0, motivoMulta = "" } = req.body;

    const [prestamo] = await connection.query(`
      SELECT p.idPrestamo, p.nroSocio, p.ISBN, ep.nombre AS estado
      FROM prestamo p
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      WHERE p.idPrestamo = ?
    `, [idPrestamo]);

    if (prestamo.length === 0) {
      return res.status(404).json({ mensaje: "El préstamo no existe" });
    }

    const estadoPrestamo = String(prestamo[0].estado || "").toUpperCase();
    if (estadoPrestamo !== "ACTIVO") {
      return res.status(400).json({ mensaje: "El préstamo ya fue finalizado" });
    }

    const [estadoDisponible] = await connection.query(
      "SELECT idEstadoLibro FROM estadoLibro WHERE nombre = 'DISPONIBLE'"
    );
    const [estadoFinalizado] = await connection.query(
      "SELECT idEstadoPrestamo FROM estadoPrestamo WHERE nombre = 'FINALIZADO'"
    );

    const fechaDevolucionReal = new Date().toISOString().split('T')[0];

    await connection.query(
      `UPDATE prestamo 
       SET fechaDevolucionReal = ?, idEstadoPrestamo = ? 
       WHERE idPrestamo = ?`,
      [fechaDevolucionReal, estadoFinalizado[0].idEstadoPrestamo, idPrestamo]
    );

    await connection.query(
      "UPDATE libro SET idEstadoLibro = ? WHERE ISBN = ?",
      [estadoDisponible[0].idEstadoLibro, prestamo[0].ISBN]
    );

    if (libroDaniado && montoMulta > 0) {
      const [maxIdMulta] = await connection.query(
        "SELECT COALESCE(MAX(idMulta), 0) + 1 AS nuevoId FROM multa"
      );

      await connection.query(
        `INSERT INTO multa (idMulta, nroSocio, idPrestamo, monto, motivo, fecha, pagada)
         VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
        [
          maxIdMulta[0].nuevoId,
          prestamo[0].nroSocio,
          idPrestamo,
          montoMulta,
          motivoMulta || "Libro devuelto con daños",
          fechaDevolucionReal
        ]
      );
    }

    await connection.commit();

    res.json({
      mensaje: "Devolución registrada correctamente",
      fechaDevolucionReal,
      multaRegistrada: libroDaniado && montoMulta > 0
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

export const updatePrestamo = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { idPrestamo } = req.params;
    const { fechaDevolucionEsperada, diasPrestamo } = req.body;

    const [rows] = await connection.query(`
      SELECT p.idPrestamo, p.fechaInicio, ep.nombre AS estado
      FROM prestamo p
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      WHERE p.idPrestamo = ?
    `, [idPrestamo]);

    if (rows.length === 0) return res.status(404).json({ mensaje: "El préstamo no existe" });
    if (rows[0].estado !== 'ACTIVO') return res.status(400).json({ mensaje: "Solo se puede editar un préstamo activo" });

    let nuevaFecha = fechaDevolucionEsperada;
    if (!nuevaFecha && diasPrestamo) {
      const inicio = new Date(rows[0].fechaInicio);
      const f = new Date(inicio);
      f.setDate(f.getDate() + parseInt(diasPrestamo, 10));
      nuevaFecha = f.toISOString().split('T')[0];
    }
    if (!nuevaFecha) return res.status(400).json({ mensaje: "Proveer fechaDevolucionEsperada o diasPrestamo" });

    await connection.query(
      `UPDATE prestamo SET fechaDevolucionEsperada = ? WHERE idPrestamo = ?`,
      [nuevaFecha, idPrestamo]
    );

    await connection.commit();
    res.json({ mensaje: "Préstamo actualizado", fechaDevolucionEsperada: nuevaFecha });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};

export const deletePrestamo = async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const { idPrestamo } = req.params;
    const [rows] = await connection.query(`
      SELECT p.idPrestamo, p.ISBN, ep.nombre AS estado
      FROM prestamo p
      JOIN estadoPrestamo ep ON p.idEstadoPrestamo = ep.idEstadoPrestamo
      WHERE p.idPrestamo = ?
    `, [idPrestamo]);

    if (rows.length === 0) return res.status(404).json({ mensaje: "El préstamo no existe" });

    if (rows[0].estado === 'ACTIVO') {
      const [estadoDisponible] = await connection.query(
        "SELECT idEstadoLibro FROM estadoLibro WHERE nombre = 'DISPONIBLE'"
      );
      await connection.query(
        "UPDATE libro SET idEstadoLibro = ? WHERE ISBN = ?",
        [estadoDisponible[0].idEstadoLibro, rows[0].ISBN]
      );
    }

    await connection.query("DELETE FROM prestamo WHERE idPrestamo = ?", [idPrestamo]);

    await connection.commit();
    res.json({ mensaje: "Préstamo eliminado correctamente" });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ error: error.message });
  } finally {
    connection.release();
  }
};


