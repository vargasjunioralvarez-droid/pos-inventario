const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

router.get('/', productoController.getProductos);
router.post('/', productoController.createProducto);
router.put('/:id', productoController.updateProducto);
router.put('/:id/precio', productoController.actualizarPrecioProducto);
router.delete('/:id', productoController.deleteProducto);
router.post('/actualizar-precios', productoController.actualizarPreciosConTasa); // ruta para actualizar todos

module.exports = router;