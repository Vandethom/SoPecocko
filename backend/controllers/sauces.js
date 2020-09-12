const Sauce = require('../models/sauce');
const sanitize = require("mongo-sanitize");

/* ------------------------- récupération de toutes les sauces ------------------------- */
exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};


/* ------------------------- récupération d'une seule sauce ------------------------- */
exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(400).json({ error }));
};


/* ------------------------- ajout d'une sauce ------------------------- */
exports.addSauce = (req, res, next) => {
    const sauceObject = JSON.parse(req.body.sauce);
    const sauce = new Sauce({
        ...sauceObject,
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauce.save()
        .then(() => res.status(201).json({ message: 'Sauce Ajoutée !' }))
        .catch(error => res.status(400).json({ error }))
};


/* ------------------------- mise à jour d'une sauce ------------------------- */
exports.onModify = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.sauce),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Objet modifié !' }))
        .catch(error => res.status(400).json({ error }));
};

/* ------------------------- suppression d'une sauce ------------------------- */
exports.onDelete = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(204).json({ message: 'Sauce supprimée' }))
        .catch(error => res.status(400).json({ error }));
};

/* ------------------------- like/dislike d'une sauce ------------------------- */

exports.likeSauce = (req, res, next) => {
    const sauce = Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const like = req.body.like;
            const user = req.body.userId;
            const usersLiked = sauce.usersLiked;
            const usersDisliked = sauce.usersDisliked
            const sauceId = req.params.id;
            const userId = req.body.userId


            if (like == 1) { // Si like
                if (usersLiked.includes(userId)) { // Si liked already => envoie une erreur json
                    res.status(403).json({ error: 'Impossible de liker deux fois la même sauce' })
                } else { // Sinon, ajoute un like
                    Sauce.findOne({ _id: sauceId })
                        .then((sauce) => {
                            Sauce.updateOne({ _id: sauceId },
                                {
                                    $push: { usersLiked: user }, // ajoute l'userId à l'array usersLiked
                                    $inc: { likes: 1 }, // ajoute un like
                                })
                                .then(() => res.status(200).json({ message: 'Like' }))
                                .catch((error) => res.status(400).json({ error }))
                        })
                        .catch((error) => res.status(404).json({ error }));
                }


            } else if (like == -1) { // si dislike
                if (usersDisliked.includes(userId)) { // Si l'user à déjà dislike, renvoie une erreur json
                    res.status(403).json({ error: 'Impossible de disliker deux fois la même sauce' })
                } else { // sinon applique un dislike
                    console.log('Cas -1')
                    Sauce.findOne({ _id: sauceId })
                        .then((sauce) => {
                            Sauce.updateOne({ _id: sauceId },
                                {
                                    $push: { usersDisliked: user }, // ajoute l'utilisateur au tableau des dislikes
                                    $inc: { dislikes: 1 }, // ajoute un dislike
                                })
                                .then(() => res.status(200).json({ message: 'Dislike' }))
                                .catch((error) => res.status(400).json({ error }))
                        })
                        .catch((error) => res.status(404).json({ error }))
                }

            } else Sauce.findOne({ _id: sauceId }) // si 0 (remise à niveau du like/dislike)
                .then((sauce) => {
                    if (sauce.usersLiked.includes(userId)) { // Si l'utilisateur avait un like, on va le retirer
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { likes: -1 }, // retire le like
                                $pull: { usersLiked: req.body.userId }, // retire l'utilisateur du tableau des likes
                                _id: sauceId
                            })
                            .then(() => { res.status(201).json({ message: 'Like retiré' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });

                    } else {
                        Sauce.updateOne({ _id: req.params.id },
                            {
                                $inc: { dislikes: -1 }, // retire le dislike
                                $pull: { usersDisliked: req.body.userId }, //  retire l'utilisateur du tableau des likes
                                _id: sauceId
                            })
                            .then(() => { res.status(201).json({ message: 'Dislike retiré' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });
                    }
                })
                .catch((error) => { res.status(500).json({ error }); });
        })
        .catch(error => res.status(500).json({ error: 'err' }))

}