// Cargar el archivo .env antes de iniciar cualquier aplicación
require('dotenv').config();

module.exports = {
  apps: [
    {
      name: "backend",
      script: "server.js",
      watch: true, // Opcional: reinicia automáticamente si detecta cambios
      env: {
        NODE_ENV: "production", // Puedes dejar estas variables aquí si las quieres forzar
        PORT: process.env.PORT, // Utiliza la variable del archivo .env
        DB_HOST: process.env.DB_HOST,
        DB_USER: process.env.DB_USER,
        DB_PASSWORD: process.env.DB_PASSWORD,
        DB_DATABASE: process.env.DB_DATABASE,
        JWT_SECRET: process.env.JWT_SECRET, // Cualquier otra variable que tengas en .env
      },
    },
  ],
};
