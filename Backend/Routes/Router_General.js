const express = require('express');
const router = express.Router();
const { getGeneral } = require('../Controllers/Controllers_General');

// Ruta para obtener los datos del `SELECT`
router.get('/', getGeneral);

module.exports = router;
