const express = require('express');
const router = express.Router();
const reporteController = require('../controllers/reporteController');

router.get('/inventario', reporteController.getReporteInventario);

module.exports = router;