const jwt = require('jsonwebtoken');
 
// Utilisation de la méthode verify() de jsonwebtoken pour vérifier la validité d'un token 
// Cela permet de sécuriser les routes de l'application en vérifiant si le jeton fourni par le client est valide
module.exports = (req, res, next) => {
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};