const express = require('express');
const cors = require('cors');
const path = require('path'); // Importa 'path' para manejar rutas de archivos
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS
// const corsOptions = {
//   origin: 'http://192.168.1.109:5001', // Cambia a tu URL de Render o localhost
//   optionsSuccessStatus: 200,
// };

const corsOptions = {
  origin: 'http://localhost:5173', // Cambia a tu URL de Render o localhost
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware para manejar JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Asegúrate de tener 'public' como carpeta de archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas API
const loginRoutes = require('./Routes/RouterLogin');
const oficinasRoutes = require('./Routes/RouterOficinas');
const usuariosRoutes = require('./Routes/RouterUsuarios');
const Not_ssb = require('./Routes/RouterNot_ssb');
const uploadRoutes = require('./Routes/RouterUpload');
const uploadRoutesNot_ssb = require('./Routes/RouterUploadNot_ssb');

const loginBD = require('./Routes/RouterBD');
const GeneralRoutes = require('./Routes/Router_General');

app.use('/api', loginRoutes);
app.use('/api/api', oficinasRoutes);
app.use('/api/users', usuariosRoutes);
app.use('/api/apinotssb', Not_ssb);
app.use('/api/api', uploadRoutes);
app.use('/api/apinot', uploadRoutesNot_ssb);

app.use('/api/bd', loginBD);
app.use('/api/general', GeneralRoutes);

// Servir archivos estáticos de la aplicación frontend (React)
// app.use(express.static(path.join(__dirname, 'dist'))); // Aquí asegúrate de que 'dist' sea la carpeta que contiene tu frontend compilado

// // Redirigir todas las rutas al archivo 'index.html' de React
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'dist', 'index.html')); // Redirige todas las rutas al archivo index.html
// });

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
