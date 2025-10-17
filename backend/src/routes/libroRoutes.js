import express from "express";
import {
  getLibros,
  addLibro,
  updateEstadoLibro,
} from "../controllers/libroController.js";

export const router = express.Router();

router.get("/", getLibros);
router.post("/", addLibro);
router.put("/:ISBN/estado", updateEstadoLibro);