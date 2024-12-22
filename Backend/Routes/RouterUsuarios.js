const express = require('express');
const router = express.Router();
const { getUsuarios, createUsuario, updateUsuario, deleteUsuario } = require('../Controllers/Controllers_Usuarios');

router.get('/usuarios', getUsuarios);
router.post('/usuarios', createUsuario);
router.put('/usuarios/:id', updateUsuario); 
router.delete('/usuarios/:id', deleteUsuario);

module.exports = router;
