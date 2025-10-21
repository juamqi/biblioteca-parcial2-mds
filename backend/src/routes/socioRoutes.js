import express from "express";
import { getSocios, addSocio, updateSocio, deleteSocio } from "../controllers/socioController.js";

export const router = express.Router();

router.get("/", getSocios);
router.post("/", addSocio);
router.put("/:nroSocio", updateSocio);
router.delete("/:nroSocio", deleteSocio);