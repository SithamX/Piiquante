const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

// Les routes définies avec les différentes méthodes HTTP (POST, PUT, DELETE, GET) ne peuvent être accessibles en premier lieu
// que si le jeton vérifié est valide (donc, uniquement si l'utilisateur à bien un compte valide authentifié)
router.post('/', auth, multer, sauceCtrl.createSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce);
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.usersLiked);
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.get('/', auth, sauceCtrl.getAllSauces);


module.exports = router;