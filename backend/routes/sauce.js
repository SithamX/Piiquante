const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const sauceCtrl = require('../controllers/sauce');

// Les routes définies avec les différentes méthodes HTTP (POST, PUT, DELETE, GET) ne peuvent être accessibles en premier lieu
// que si le jeton vérifié est valide (donc, uniquement si l'utilisateur à bien un compte authentifié)
router.get('/', auth, sauceCtrl.getAllSauces);
router.post('/', auth, multer, sauceCtrl.createSauce); // Ici, Multer est utilisé pour gérer les fichiers téléchargés (dans notre contexte, il est question des images)
router.get('/:id', auth, sauceCtrl.getOneSauce);
router.put('/:id', auth, multer, sauceCtrl.modifySauce); // Ici aussi, Multer est utilisé pour gérer les fichiers téléchargés (dans notre contexte, il est question des images)
router.delete('/:id', auth, sauceCtrl.deleteSauce);
router.post('/:id/like', auth, sauceCtrl.likeAndDislikeSauce);


module.exports = router;