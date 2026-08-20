const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken, verificarRol } = require('../middlewares/auth');

router.post('/login', authController.login);
router.get('/usuarios', verificarToken, verificarRol('ADMIN'), authController.getUsuarios);
router.post('/registrar', verificarToken, verificarRol('ADMIN'), authController.registrar);
router.put('/usuarios/:id', verificarToken, verificarRol('ADMIN'), authController.updateUsuario);

module.exports = router;