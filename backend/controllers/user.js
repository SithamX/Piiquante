const bcrypt = require('bcrypt'); // Importation du package de chiffrement
const jwt = require('jsonwebtoken'); // Importation du package permettant de créer et de vérifier des tokens d'authentification

require("dotenv").config();
const JWT_SECRET = process.env.TOKEN_SECRET || "cryptedToken";

const User = require('../models/User');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // Le mot de passe reçu dans la requête est hashé et l'algorythme de hashage fait 10 tours ( ce qui est suffisant pour créer un mot de passe sécurisé rapidement)
        .then(hash => {
            const user = new User({ // Une instance de l'utilisateur avec l'email et le mot de passe hashé est créée
                email: req.body.email,
                password: hash
            });
            user.save() 
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email }) // Recherche de l'utilisateur dans la base de données par son email
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' }); // Si l'utilisateur n'est pas trouvé, une erreur est retournée
            }
            bcrypt.compare(req.body.password, user.password)  // Comparaison du mot de passe reçu dans la requête avec le mot de passe hashé de l'utilisateur
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' }); // Si les mots de passe ne correspondent pas, une erreur est retournée
                    }
                    res.status(200).json({  // Si les mots de passe correspondent, on génère la réponse suivante dans un objet JSON :
                        userId: user._id, // on ajoute l'id de l'utilisateur ;
                        token: jwt.sign( // on ajout le token en utilisant la fonction sign de jsonwebtoken pour chiffrer un nouveau mot de passe ;
                            { userId: user._id }, // on s'assure que la requête correspond bien au bon userId
                            JWT_SECRET, // on utilise une chaîne secrète de développement temporaire (qui sera remplacée par une chaîne aléatoire)
                            { expiresIn: '24h' } // on choisit une durée de validité du token de 24 heures, donc l'utilisateur devra se reconnecter au bout de 24 heures.
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};