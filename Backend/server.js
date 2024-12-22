const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: 'http://localhost:5001', // Cambia a tu URL de Render
  optionsSuccessStatus: 200,
};
// const corsOptions = {
//   origin: 'http://localhost:3655', // Cambia a tu URL de Render
//   optionsSuccessStatus: 200,
// };

app.use(cors(corsOptions));


// Middleware
// app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
// Rutas
const loginRoutes = require('./Routes/RouterLogin');
const oficinasRoutes = require('./Routes/RouterOficinas');
const usuariosRoutes = require('./Routes/RouterUsuarios'); // Nueva ruta
const Not_ssb = require('./Routes/RouterNot_ssb');
// const Sinot = require('./Routes/RouterSinot');
const uploadRoutes = require('./Routes/RouterUpload');
const uploadRoutesNot_ssb = require('./Routes/RouterUploadNot_ssb');

app.use('/api', loginRoutes);
app.use('/api/api', oficinasRoutes); // Prefijo /api para las rutas de oficinas
app.use('/api/users', usuariosRoutes); // Prefijo /api para las rutas de usuarios
app.use('/api/apinotssb', Not_ssb); // Prefijo /api para las rutas de excel
// app.use('/apisinot', Sinot);
app.use('/api/api', uploadRoutes);
app.use('/api/apinot', uploadRoutesNot_ssb);
// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
