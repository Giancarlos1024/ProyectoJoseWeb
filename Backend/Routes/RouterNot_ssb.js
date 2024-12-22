// src/routes/excelRoutes.js
const express = require('express');
const router = express.Router();
const NotssbController = require('../Controllers/Controllers_Not_ssb');

router.get('/notssb', NotssbController.getAllRecords);
router.get('/recordcount', NotssbController.getRecordCount);
router.get('/notssb/:id', NotssbController.getRecordById);
router.post('/notssb', NotssbController.createRecord);
router.put('/notssb/:id', NotssbController.updateRecord);
router.delete('/notssb/:id', NotssbController.deleteRecord);

module.exports = router;
