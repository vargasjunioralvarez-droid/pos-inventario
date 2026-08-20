const express = require('express');
const router = express.Router();
const conteoController = require('../controllers/conteoController');

router.post('/', conteoController.crearConteo);
router.get('/', conteoController.getConteos);
router.get('/:id', conteoController.getConteoById);
router.put('/:id', conteoController.updateConteo);
router.post('/:id/detalles', conteoController.upsertDetalleConteo);
router.put('/:id/cerrar', conteoController.cerrarConteo);
router.delete('/:id', conteoController.deleteConteo);
router.delete('/:id/detalles/:detalleId', conteoController.deleteDetalleConteo);

module.exports = router;