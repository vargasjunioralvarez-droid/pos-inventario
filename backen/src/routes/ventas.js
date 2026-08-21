const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/ventaController');

router.post('/', ventaController.crearVenta);
router.get('/', ventaController.getVentas);
router.get('/reporte', ventaController.getVentasPorMetodo);
router.put('/:id/pago', ventaController.updatePagoVenta);

module.exports = router;