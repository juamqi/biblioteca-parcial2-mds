import express from "express";
import {
  getPrestamos,
  addPrestamo,
  devolverLibro,
  getPrestamosPorSocio,
  getPrestamosActivos
} from "../controllers/prestamoController.js";

export const router = express.Router();

router.get("/", getPrestamos);
router.get("/activos", getPrestamosActivos);
router.get("/socio/:nroSocio", getPrestamosPorSocio);
router.post("/", addPrestamo);
router.put("/:idPrestamo/devolver", devolverLibro);