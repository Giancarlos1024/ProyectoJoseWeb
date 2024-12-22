const pool = require('../Config/conexion');

// Obtener todos los usuarios
const getUsuarios = (req, res) => {
  pool.query('SELECT * FROM usuarios', (error, results) => {
    if (error) return res.status(500).send(error);
    res.json(results);
  });
};

// Crear un nuevo usuario
const createUsuario = (req, res) => {
  const { usuario, contrasena, roles } = req.body;
  pool.query('INSERT INTO usuarios (usuario, contrasena, roles) VALUES (?, ?, ?)', 
  [usuario, contrasena, roles], (error) => {
    if (error) return res.status(500).send(error);
    res.send('Usuario agregado');
  });
};

// Actualizar un usuario
const updateUsuario = (req, res) => {
  const { id } = req.params;
  const { usuario, contrasena, roles } = req.body;
  pool.query('UPDATE usuarios SET usuario = ?, contrasena = ?, roles = ? WHERE id = ?',
    [usuario, contrasena, roles, id], (error) => {
    if (error) return res.status(500).send(error);
    res.send('Usuario actualizado');
  });
};

// Eliminar un usuario
const deleteUsuario = (req, res) => {
  const { id } = req.params;
  pool.query('DELETE FROM usuarios WHERE id = ?', [id], (error) => {
    if (error) return res.status(500).send(error);
    res.send('Usuario eliminado');
  });
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario
};
