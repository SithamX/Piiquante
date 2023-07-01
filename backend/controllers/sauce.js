const Sauce = require('../models/Sauce');
const fs = require('fs');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId; // Suppression du champ _userId pour sécuriser la route (pour éviter qu'un client n'utilise le _userId d'un autre)
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId, // Le _userId non-récupéré est remplcé par celui extrait du token d'authentification
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //  L'URL de l'image est générée en utilisant le protocole et l'hôte de la requête, ainsi que le nom de fichier fourni par multer
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' })})
        .catch(error => { res.status(400).json({ error })});
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
        .then( sauce => res.status(200).json(sauce))
        .catch( error => res.status(404).json({ error }));
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? { // Lors de la modification d'une sauce, si req.file existe (donc si l'image est modifiée), la nouvelle image est traitée, sinon, seul l'objet entrant est traité 
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}` //  L'URL de l'image est générée en utilisant le protocole et l'hôte de la requête, ainsi que le nom de fichier fourni par multer
    } : { ...req.body }; // Donc ici, s'il n'y à pas d'image transmise, alors on récupère directement l'objet dans le corps de la requête

    delete sauceObject._userId;  // Suppression du champ _userId pour sécuriser la route (pour éviter qu'un client ayant créé un objet à son nom ne le modifie en le réassignant à quelqu'un d'autre)
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) { 
                res.status(401).json({ message: 'Not authorized' });
            } else { // Si l'objet appartient bien à l'utilisateur'qui envoie la requête de modification, alors l'enregistrement est mis à jour
                Sauce.updateOne({ _id: req.params.id}, { ...sauceObject, _id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
                    .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteSauce = (req, res, next) => {
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
                const filename = sauce.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => { // Utilisation de unlink pour que les images soient supprimées dans le dossier local 
                    Sauce.deleteOne({_id: req.params.id})
                    .then(() => res.status(200).json({ message: 'Sauce supprimée !' }))
                    .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch((error) => {
            res.status(500).json({ error });
        });
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
};


//-----------------Like & Dislike-----------------\\


exports.likeAndDislikeSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id }) // Recherche d'une sauce spécifique dans la base de données en utilisant l'ID fourni dans les paramètres de la requête
        .then((sauce) => {
            if (req.body.like === 1) { // Si l'utilisateur à effectué un like (puisque si c'est positif, c'est qu'il est question d'un like), alors :
                if (!sauce.usersLiked.includes(req.auth.userId)) { // on vérifie si l'utilisateur n'a pas déjà liké la sauce ;
                    sauce.likes += 1; // on incrémente la valeur ;
                    sauce.usersLiked.push(req.auth.userId); // et on ajoute l'id de l'utilisateur ayant liké la sauce dans le tableau correspondant.
                } else {
                    return res.status(400).json({ message: "Vous avez déjà liké cette sauce." });
                }
            } else if (req.body.like === -1) {  // Si l'utilisateur à effectué un dislike (puisque si c'est négatif, c'est qu'il est question d'un dislike), alors :
                if (!sauce.usersDisliked.includes(req.auth.userId)) { // on vérifie si l'utilisateur n'a pas déjà disliké la sauce ;
                    sauce.dislikes += 1; // on incrémente la valeur ;
                    sauce.usersDisliked.push(req.auth.userId); // et on ajoute l'id de l'utilisateur ayant liké la sauce dans le tableau correspondant.
                } else {
                    return res.status(400).json({ message: "Vous avez déjà disliké cette sauce." });
                }
            } else if (req.body.like === 0) { // Si l'utilisateur souhaite retirer son like ou son dislike (puisque le zéro signifie que l'utilisateur annule l'action qu'il a effectuée), alors :
                if (sauce.usersLiked.includes(req.auth.userId)) { // on vérifie si l'utilisateur a déjà liké la sauce ;
                    sauce.likes -= 1; // puis on décrémente la valeur ;
                    sauce.usersLiked = sauce.usersLiked.filter(userId => userId !== req.auth.userId); // et on retire l'id de l'utilisateur ayant liké la sauce du tableau correspondant ;
                } else if (sauce.usersDisliked.includes(req.auth.userId)) { // ou on vérifie si l'utilisateur a déjà disliké la sauce ;
                    sauce.dislikes -= 1; // puis on décrémente la valeur ;
                    sauce.usersDisliked = sauce.usersDisliked.filter(userId => userId !== req.auth.userId); // et on retire l'id de l'utilisateur ayant disliké la sauce du tableau correspondant.
                } else {
                    return res.status(400).json({ message: "Vous n'avez pas encore liké ou disliké cette sauce." });
                }
            }

            sauce.save()
                .then(() => res.status(200).json({ message: 'Opération effectuée avec succès.' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error }));
};
