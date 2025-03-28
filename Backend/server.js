const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;  // Usa 5001 ya que ese es el puerto de tu backend


// Configuración de CORS
// const corsOptions = {
//   origin: 'http://192.168.1.103:5001', // Cambia a tu URL de Render o localhost
//   optionsSuccessStatus: 200,
// };

const corsOptions = {
  origin: 'http://localhost:5173', // Cambia a tu URL de Render o localhost
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());



// 📌 Servir imágenes u otros archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas API
const loginRoutes = require("./Routes/RouterLogin");
const oficinasRoutes = require("./Routes/RouterOficinas");
const usuariosRoutes = require("./Routes/RouterUsuarios");
const Not_ssb = require("./Routes/RouterNot_ssb");
const uploadRoutes = require("./Routes/RouterUpload");
const uploadRoutesNot_ssb = require("./Routes/RouterUploadNot_ssb");
const loginBD = require("./Routes/RouterBD");
const GeneralRoutes = require("./Routes/Router_General");

app.use("/api", loginRoutes);
app.use("/api/api", oficinasRoutes);
app.use("/api/users", usuariosRoutes);
app.use("/api/apinotssb", Not_ssb);
app.use("/api/apupload", uploadRoutes);
app.use("/api/apinot", uploadRoutesNot_ssb);
app.use("/api/bd", loginBD);
app.use("/api/general", GeneralRoutes);

// 📌 Redirigir todas las rutas desconocidas al frontend (React Router)
// Redirigir todas las rutas desconocidas al frontend
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../frontend/dist", "index.html"));
});

// Iniciar servidor en todas las interfaces de red
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Servidor corriendo en http://192.168.1.103:${port}`);
});
