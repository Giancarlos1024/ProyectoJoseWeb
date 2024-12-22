const express = require('express');
const router = express.Router();
const { 
    getLogin, 
    postLogin, 
    updateLogin, 
    deleteLogin 

} = require('../Controllers/Controllers_login');

// Rutas

router.get('/', getLogin);
router.post('/autenticarlogin', postLogin);
router.post('/actualizarlogin', updateLogin);
router.post('/eliminarlogin', deleteLogin);

module.exports = router;
