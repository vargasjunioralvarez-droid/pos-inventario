const express = require('express');
const router = express.Router();
const parametroController = require('../controllers/parametroController');

router.get('/', parametroController.getParametro);
router.post('/', parametroController.upsertParametro);

module.exports = router;