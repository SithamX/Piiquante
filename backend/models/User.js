const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // Ce package sert à gérer les erreurs gérénées par MongoDB lors de l'utilisation de "unique: true" pour l'atribut "email"

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true }, // Utiliser "unique" permet de garantir qu'un utilisateur ne puisse pas s'inscrire deux fois avec la même adresse mail 
  password: { type: String, required: true }
});

userSchema.plugin(uniqueValidator); // Ici uniqueValidator est passé comme plug-in et est appliqué au schéma de l'utilisateur

module.exports = mongoose.model('User', userSchema);