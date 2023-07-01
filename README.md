# HotTakes

Hot Takes est un site de notation de sauces piquantes. Pour accéder à la page des sauces, l'utilisateur doit d'abord se créer un compte ou se connecter à un compte déjà existant. Les différentes fonctionnalités de cette application web sont : l'ajout d'une nouvelle sauce, la possibilité de modifier ou de supprimer une sauce que l'on aurait ajouté et la possibilité de liker ou de disliker n'importe quelle sauce.

## Avant de démarer le frontend et le backend  :

Un fichier `.env` à été ajouté dans le `.gitignore` pour sécuriser ce qui s'y trouve. Car c'est dans ce fichier que sont stockés l'identifant, le mot de passe et l'url du cluster MongoDB utilisé ainsi que l'algorithme de génération aléatoire du TOKEN d'authentification. 

Dans le dossier `backend` créez un fichier `.env`, et dans ce fichier, veuillez ajouter le code suivant : 

```
idMongoDb = (à la place de ces parenthèses écrivez votre identifant entre des guillemets)
passwordMongoDb = (à la place de ces parenthèses écrivez votre mode de passe entre des guillemets)
urlMongoDb = (à la place de ces parenthèses et entre des guillemets, écrivez la suite de l'url situé après le arobase)
```

Et dans le même fichier, veuillez ajouter le code suivant :

```
const crypto = require('crypto'); 
const cryptedToken = crypto.randomBytes(64).toString('hex'); 
TOKEN_SECRET = cryptedToken; 
```

## Pour démarer le frontend :

Rendez-vous dans le dossier `frontend`, tapez la commande `npm install` puis `npm run start` et enfin, rendez-vous sur l'adresse suivante après avoir démarré le backend `http://localhost:4200/`. 

## Pour démarer le backend :

Rendez-vous dans le dossier `backend`, tapez la commande `npm install` puis `npm run start`.
