const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

router.get('/', compraController.getCompras);
router.post('/', compraController.crearCompra);
router.put('/:id', compraController.updateCompra);
router.delete('/:id', compraController.deleteCompra);

module.exports = router;