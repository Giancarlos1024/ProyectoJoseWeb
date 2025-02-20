const pool = require('../Config/conexion');

// Obtener todos los usuarios
const getUsuarios = (req, res) => {
  pool.query('SELECT * FROM usuarios', (error, results) => {
    if (error) return res.status(500).send(error);
    res.json(results);
  });
};

// Crear un nuevo usuario
// Crear un nuevo usuario
const createUsuario = (req, res) => {
  const { usuario, contrasena, roles, creado_por } = req.body; // Incluye el campo creado_por

  // Verifica que el creador no sea un "Jefe de Área" intentando crear un "Admin"
  const creatorRole = req.query.role; // Obtén el rol del creador desde la consulta

  if (creatorRole === 'Jefe de Area' && roles === 'Admin') {
    return res.status(403).send('Los Jefes de Área no pueden crear usuarios con rol Admin.');
  }

  if (!creado_por) {
    return res.status(400).send('El campo creado_por es obligatorio');
  }

  pool.query(
    'INSERT INTO usuarios (usuario, contrasena, roles, creado_por) VALUES (?, ?, ?, ?)', 
    [usuario, contrasena, roles, creado_por],
    (error) => {
      if (error) return res.status(500).send(error);
      res.send('Usuario agregado');
    }
  );
};


// Actualizar un usuario
const updateUsuario = (req, res) => {
  const { id } = req.params;
  const { usuario, contrasena, roles } = req.body;

  pool.query(
    'UPDATE usuarios SET usuario = ?, contrasena = ?, roles = ? WHERE id = ?',
    [usuario, contrasena, roles, id],
    (error) => {
      if (error) return res.status(500).send(error);
      res.send('Usuario actualizado');
    }
  );
};

// Eliminar un usuario
const deleteUsuario = (req, res) => {
  const { id } = req.params;

  pool.query(
    'DELETE FROM usuarios WHERE id = ?', 
    [id], 
    (error) => {
      if (error) return res.status(500).send(error);
      res.send('Usuario eliminado');
    }
  );
};

module.exports = {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
};
