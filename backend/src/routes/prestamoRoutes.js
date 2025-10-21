import express from "express";
import {
  getPrestamos,
  addPrestamo,
  devolverLibro,
  getPrestamosPorSocio,
  getPrestamosActivos,
  updatePrestamo,
  deletePrestamo
} from "../controllers/prestamoController.js";

export const router = express.Router();

router.get("/", getPrestamos);
router.get("/activos", getPrestamosActivos);
router.get("/socio/:nroSocio", getPrestamosPorSocio);
router.post("/", addPrestamo);
router.put("/:idPrestamo/devolver", devolverLibro);
router.put("/:idPrestamo", updatePrestamo);
router.delete("/:idPrestamo", deletePrestamo);
