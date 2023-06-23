const mongoose =  require('mongoose');

// Utilisation de la méthode Schema de Mongoose pour créer un schema de données pour la base de donnée MongoDB
const sauceSchema = mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    manufacturer: { type: String, required: true },
    description: { type: String, required: true },
    mainPepper: { type: String, required: true },
    imageUrl: { type: String, required: true },
    heat: { type: Number, required: true },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    usersLiked: { type: Array, default: [] },
    usersDisliked: { type: Array, default: [] },
});

// Utilisation de la méthode  model qui transforme ce modèle en un modèle utilisable.
module.exports = mongoose.model('Sauce', sauceSchema);