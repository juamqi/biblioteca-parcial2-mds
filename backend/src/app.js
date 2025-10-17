import express from "express";
import cors from "cors";
import { router as socioRoutes } from "./routes/socioRoutes.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/socios", socioRoutes);

app.listen(process.env.PORT || 3001, () => {
  console.log(`Servidor backend corriendo en puerto ${process.env.PORT || 3001}`);
});