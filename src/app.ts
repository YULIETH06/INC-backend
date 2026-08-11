import express from "express";
import cors from "cors";
import path from "path";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// Permite acceder públicamente a los archivos subidos.
app.use("/uploads", express.static(path.resolve("uploads")));

// Rutas
app.use("/api", routes);

export default app;