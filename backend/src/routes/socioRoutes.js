import express from "express";
import { getSocios, addSocio } from "../controllers/socioController.js";

export const router = express.Router();

router.get("/", getSocios);
router.post("/", addSocio);
