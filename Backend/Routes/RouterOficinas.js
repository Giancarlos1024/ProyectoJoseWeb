const express = require('express');
const router = express.Router();
const oficinasController = require('../Controllers/Controllers_Oficinas');

// Crear una nueva oficina
router.post('/oficinas', oficinasController.create);

// Obtener todas las oficinas
router.get('/oficinas', oficinasController.getAll);

// Actualizar una oficina
router.put('/oficinas/:id', oficinasController.update);

// Eliminar una oficina
router.delete('/oficinas/:id', oficinasController.delete);

module.exports = router;
