const express = require('express');
const router = express.Router();
const { 
    getBD, 

} = require('../Controllers/Controllers_BD');

// Rutas

router.get('/', getBD);

module.exports = router;
