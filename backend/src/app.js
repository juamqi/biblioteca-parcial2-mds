import express from "express";
import cors from "cors";
import { router as socioRoutes } from "./routes/socioRoutes.js";
import { router as libroRoutes } from "./routes/libroRoutes.js";
import { router as prestamoRoutes } from "./routes/prestamoRoutes.js";
import { router as multaRoutes } from "./routes/multaRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/socios", socioRoutes);
app.use("/api/libros", libroRoutes);
app.use("/api/prestamos", prestamoRoutes);
app.use("/api/multas", multaRoutes);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Servidor backend corriendo en puerto ${process.env.PORT || 3001}`);
});