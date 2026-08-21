const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.post('/', productoController.createProducto);
router.put('/actualizar-precios', productoController.actualizarPreciosConTasa);
router.put('/:id', productoController.updateProducto);
router.put('/:id/precio', productoController.actualizarPrecioProducto);
router.delete('/:id', productoController.deleteProducto);

module.exports = router;