import express from "express";
import {
  getMultas,
  getMultasPorSocio,
  getMultasPendientes,
  pagarMulta
} from "../controllers/multaController.js";

export const router = express.Router();

router.get("/", getMultas);
router.get("/pendientes", getMultasPendientes);
router.get("/socio/:nroSocio", getMultasPorSocio);
router.put("/:idMulta/pagar", pagarMulta);