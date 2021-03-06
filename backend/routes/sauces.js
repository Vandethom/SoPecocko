
const express = require('express');
const router = express.Router();
const sauceCtrl = require('../controllers/sauces');
const userController = require('../controllers/user');

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

router.get('/', auth, sauceCtrl.getAllSauces);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.post('/', auth, multer, sauceCtrl.addSauce);
router.put('/:id', auth, multer, sauceCtrl.onModify);
router.delete('/:id', auth, /*userController.grantAccess('deleteAny', 'sauce'),*/ sauceCtrl.onDelete);
router.post('/:id/like', auth, sauceCtrl.likeSauce);

module.exports = router;