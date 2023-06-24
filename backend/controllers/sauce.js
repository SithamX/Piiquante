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
    if (req.body.like === 1) {
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            sauce.likes += 1; // Incrémente la valeur de "likes"
            sauce.usersLiked.push(req.body.userId); // Ajoute "req.body.userId" au tableau "usersLiked"
            sauce.save() // Enregistre le document mis à jour dans la collection
                .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(401).json({ error }));
    } else if (req.body.like === -1){
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                sauce.dislikes += 1; // Décrémente la valeur de "likes"
                sauce.usersDisliked.push(req.body.userId); // Ajoute "req.body.userId" au tableau "usersLiked
                sauce.save() // Enregistre le document mis à jour dans la collection
                    .then(() => res.status(200).json({ message: 'Sauce dislikée !' }))
                    .catch(error => res.status(401).json({ error }));
            })
            .catch(error => res.status(401).json({ error }));
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.indexOf(req.body.userId) !== -1) {
                    Sauce.findOne({ _id: req.params.id })
                    .then((sauce) => {
                        sauce.usersLiked.splice(req.body.userId, 1);
                        sauce.likes -= 1; // Décrémente la valeur de "likes"                    
                        sauce.save() // Enregistre le document mis à jour dans la collection
                            .then(() => res.status(200).json({ message: 'Like retiré !' }))
                            .catch(error => res.status(401).json({ error }));
                    })
                    .catch(error => res.status(401).json({ error }));
                } else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {
                    Sauce.findOne({ _id: req.params.id })
                    .then((sauce) => {
                        sauce.usersDisliked.splice(req.body.userId, 1);
                        sauce.dislikes -= 1; // Incrémente la valeur de "likes"
                        sauce.save() // Enregistre le document mis à jour dans la collection
                            .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
                            .catch(error => res.status(401).json({ error }));
                    })
                    .catch(error => res.status(401).json({ error }));
                }
            })
            .catch(error => res.status(401).json({ error }));
    }
};
