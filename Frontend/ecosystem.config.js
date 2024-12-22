// ejecutar en el cmd → pm2 serve dist 5001 --name "frontend"

module.exports = {
  apps: [
    {
      name: "frontend",
      script: "npx",
      args: "serve -s ./dist -l 5001",  // Asegúrate de que el directorio 'dist' esté correctamente especificado
      cwd: "./",  // Ruta de trabajo de tu proyecto
      env: {
        NODE_ENV: "production",  // Entorno de producción
      },
    },
  ],
};
