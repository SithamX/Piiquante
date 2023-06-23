const express = require('express'); // Importation du module 'express' pour créer une application web
const mongoose = require('mongoose'); // Importation du module 'mongoose' pour interagir avec la base de données MongoDB
const path = require('path'); // Importation du module 'path' pour gérer les chemins de fichiers

const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');

// Connexion à la base de données MongoDB
mongoose.connect('mongodb+srv://mathis-piiquante:piiquante@cluster1.0dyqvkc.mongodb.net/?retryWrites=true&w=majority',
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

// Création de l'application Express
const app = express();

app.use(express.json()); // Middleware qui intercepte toutes les requêtes qui contiennent du JSON et met leur body à disposition sur l'objet req

// Middleware qui gère les autorisations de partage des ressources entre domaines
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

app.use('/api/sauces', sauceRoutes); // Utilise les routes spécifiées pour les endpoints '/api/sauces'
app.use('/api/auth', userRoutes); // Utilise les routes spécifiées pour les endpoints '/api/auth'
app.use('/images', express.static(path.join(__dirname, 'images'))); // Définit le dossier 'images' comme étant statique pour servir les fichiers d'images


module.exports = app;