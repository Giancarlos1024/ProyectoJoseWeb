const express = require('express');
const router = express.Router();
const { uploadFile } = require('../Controllers/uploadController');

// Ruta para la subida de archivos
router.post('/upload', uploadFile);

module.exports = router;
