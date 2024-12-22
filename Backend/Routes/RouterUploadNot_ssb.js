const express = require('express');
const router = express.Router();
const { uploadFileNotssb } = require('../Controllers/uploadControllerNotssb');

// Ruta para la subida de archivos
router.post('/upload2', uploadFileNotssb);

module.exports = router;
