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
        .catch(error => res.status(404).json({ error }));
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
exports.updateSauce = (req, res, next) => {
    const sauceObject = req.file ?
        {
            ...JSON.parse(req.body.thing),
            imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        } : { ...req.body };
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce modifiée !' }))
        .catch(error => res.status(400).json({ error }))
};


/* ------------------------- suppression d'une sauce ------------------------- */
exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
        .catch(error => res.status(400).json({ error }));
};

/* ------------------------- like/dislike d'une sauce ------------------------- */

exports.likeSauce = (req, res, next) => {
    let user = req.body.userId;
    let sauceId = req.params.id;

    switch (req.body.like) {
        case 1:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    Sauce.updateOne({ _id: sauceId }, {
                        $push: { usersLiked: user },
                        $inc: { likes: 1 },
                    })
                        .then(() => res.status(200).json({ message: 'Like' }))
                        .catch((error) => res.status(400).json({ error }))
                })
                .catch((error) => res.status(404).json({ error }));
            break;
        case -1:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    Sauce.updateOne({
                        _id: sauceId
                    }, {
                        $push: { usersDisliked: user },
                        $inc: { dislikes: 1 },
                    })
                        .then(() => res.status(200).json({ message: 'Dislike' }))
                        .catch((error) => res.status(400).json({ error }))
                })
                .catch((error) => res.status(404).json({ error }))
            break;
        default:
            Sauce.findOne({ _id: sauceId })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(user)) {
                        Sauce.updateOne({
                            _id: sauceId
                        }, {
                            $pull: { usersLiked: user },
                            $inc: { likes: -1 },
                            $inc: { dislikes: +1 }
                        })
                            .then(() => res.status(200).json({ message: 'Dislike' }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(user)) {
                        Sauce.updateOne({ _id: sauceId },
                            {
                                $pull: { usersDisliked: user },
                                $inc: { dislikes: -1 },
                                $inc: { likes: +1 }
                            })
                            .then(() => res.status(200).json({ message: 'Like' }))
                            .catch((error) => res.status(400).json({
                                error
                            }))
                    }
                })
                .catch((error) => res.status(404).json({ error }));
    }
}


