import express from "express";
import {
  getLibros,
  addLibro,
  updateEstadoLibro,
  updateLibro,
  deleteLibro,
} from "../controllers/libroController.js";

export const router = express.Router();

router.get("/", getLibros);
router.post("/", addLibro);
router.put("/:ISBN/estado", updateEstadoLibro);
router.put("/:ISBN", updateLibro);
router.delete("/:ISBN", deleteLibro);