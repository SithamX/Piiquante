const jwt = require('jsonwebtoken');

require("dotenv").config(); // Chargement des variables d'environnement à partir du fichier .env
const JWT_SECRET = process.env.TOKEN_SECRET; // Utilisation de la variable d'environnement TOKEN_SECRET 
 
// Utilisation de la méthode verify() de jsonwebtoken pour vérifier la validité d'un token 
// Cela permettra de sécuriser les routes de l'application en vérifiant si le jeton fourni par le client est valide
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1]; // Récupération du token d'authentification à partir des en-têtes de la requête
       const decodedToken = jwt.verify(token, JWT_SECRET); // Vérification de la validité du token en utilisant la méthode verify
       const userId = decodedToken.userId; // Extraction de l'ID utilisateur à partir du token décodé
       req.auth = {
           userId: userId // Ajout de l'ID de l'utilisateur à l'objet req pour que les différentes routes puissent l'exploiter
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};