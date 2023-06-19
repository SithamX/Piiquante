const Sauce = require('../models/Sauce');

exports.createSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        userId: req.auth.userId,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });

    sauce.save()
        .then(() => { res.status(201).json({ message: 'Sauce enregistrée !' })})
        .catch(error => { res.status(400).json({ error })});
};

exports.modifySauce = (req, res, next) => {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };

    delete sauceObject._userId;
    Sauce.findOne({_id: req.params.id})
        .then((sauce) => {
            if (sauce.userId != req.auth.userId) {
                res.status(401).json({ message: 'Not authorized' });
            } else {
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
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet supprimé !'}))
        .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({_id : req.params.id})
        .then( sauce => res.status(200).json(sauce))
        .catch( error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(404).json({ error }));
  };




//---------------Like & Dislike-----------------\\





exports.usersLiked = (req, res, next) => {
    if (req.body.like === 1) {
      Sauce.findOne({ _id: req.params.id })
        .then((sauce) => {
            sauce.likes += 1; // Incrémenter la valeur de "likes"
            sauce.usersLiked.push(req.body.userId); // Ajouter "req.body.userId" au tableau "usersLiked"
  
            sauce.save() // Enregistrer le document mis à jour dans la collection
                .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                .catch(error => res.status(401).json({ error }));
        })
        .catch(error => res.status(401).json({ error }));
    } else if (req.body.like === -1){
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                sauce.dislikes += 1; // Incrémenter la valeur de "likes"
                sauce.usersDisliked.push(req.body.userId); // Ajouter "req.body.userId" au tableau "usersLiked"
    
                sauce.save() // Enregistrer le document mis à jour dans la collection
                    .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                    .catch(error => res.status(401).json({ error }));
            })
            .catch(error => res.status(401).json({ error }));
    } else {
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.includes(req.body.userId) !== 0) {
                    Sauce.findOne({ _id: req.params.id })
                    .then((sauce) => {
                        sauce.likes -= 1; // Incrémenter la valeur de "likes"
                        sauce.usersLiked.splice(req.body.userId, 1);
            
                        sauce.save() // Enregistrer le document mis à jour dans la collection
                            .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                            .catch(error => res.status(401).json({ error }));
                    })
                    .catch(error => res.status(401).json({ error }));
                } else if (sauce.usersDisliked.includes(req.body.userId) !== 0) {
                    Sauce.findOne({ _id: req.params.id })
                    .then((sauce) => {
                        sauce.dislikes -= 1; // Incrémenter la valeur de "likes"
                        sauce.usersDisliked.splice(req.body.userId, 1);
            
                        sauce.save() // Enregistrer le document mis à jour dans la collection
                            .then(() => res.status(200).json({ message: 'Sauce likée !' }))
                            .catch(error => res.status(401).json({ error }));
                    })
                    .catch(error => res.status(401).json({ error }));
                }
            })
            
            .catch(error => res.status(401).json({ error }));
    }
};
