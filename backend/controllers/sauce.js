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
    if (req.body.like === 1) { // Si l'utilisateur à effectué un like (puisque si c'est positif, c'est qu'il est question d'un like), alors :
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            sauce.likes += 1; // la valeur est incrémentée ;
            sauce.usersLiked.push(req.body.userId); // l'id de l'utilisateur ayant liké la sauce est ajouté dans le tableau correspondant ;
            sauce.save() // puis tout cela est enregistré dans la base de données.
                .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                .catch(error => res.status(400).json({ error }));
        })
        .catch(error => res.status(404).json({ error }));
    } else if (req.body.like === -1){ // Si l'utilisateur à effectué un dislike (puisque si c'est négatif, c'est qu'il est question d'un dislike), alors :
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                sauce.dislikes += 1; // la valeur est incrémentée ;
                sauce.usersDisliked.push(req.body.userId); // l'id de l'utilisateur ayant liké la sauce est ajouté dans le tableau correspondant ;
                sauce.save() // puis tout cela est enregistré dans la base de données.
                    .then(() => res.status(200).json({ message: 'Sauce dislikée !' }))
                    .catch(error => res.status(400).json({ error }));
            })
            .catch(error => res.status(404).json({ error }));
    } else { // Si l'utilisateur retire son like ou son dislike, alors :
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {

                // Précision : dans les deux conditions suivantes, la méthode indexOff est utilisée, cette méthode compare l'élément recheché aux éléments contenus dans le tableau spécifié, 
                // si l'élément n'est pas trouvé, alors elle renvoie -1 (c'est un peu comme si elle renvoyait "false" en cas d'échec) donc, dans les deux conditions,
                // en ajoutant "!== -1" on précise que l'on recherche un cas où la réponse de indexOf doit être nécessairement valide (puisque différente de -1).
                //
                // Pour être plus concret, en prenant pour exemple la première condition, avant de retirer le like on dit "si dans le tableau usersLiked il y à l'ID de l'utilisateur qui appuie sur le bouton like, alors :" (et les lignes de code en dessous des conditions donnent les instructions à suivre).

                if (sauce.usersLiked.indexOf(req.body.userId) !== -1) { // dans le cas où l'utilisateur avait déjà effectué un "like" :    
                    sauce.usersLiked.splice(req.body.userId, 1); // l'ID de l'utilisateur est retiré du tableau "usersLiked" ;
                    sauce.likes -= 1; // la valeur est décrémentée ;                   
                    sauce.save() // puis tout cela est enregistré dans la base de données.
                        .then(() => res.status(200).json({ message: 'Like retiré !' }))
                        .catch(error => res.status(400).json({ error })); 
                } else if (sauce.usersDisliked.indexOf(req.body.userId) !== -1) {  // dans le cas où l'utilisateur avait déjà effectué un "dislike" :
                    sauce.usersDisliked.splice(req.body.userId, 1); // l'ID de l'utilisateur est retiré du tableau "usersDisiked" ;
                    sauce.dislikes -= 1; // la valeur est décrémentée ; 
                    sauce.save() // puis tout cela est enregistré dans la base de données.
                        .then(() => res.status(200).json({ message: 'Dislike retiré !' }))
                        .catch(error => res.status(400).json({ error })); 
                }
            })
            .catch(error => res.status(404).json({ error }));
        }
};
