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









/* ----------------------------------------------------------------------------------Ma version en cours
exports.likeSauce = (req, res, next) => {
    const sauce = Sauce.findOne({ _id: req.params.id })
        .then(sauce => {
            const userId = req.params.userId;
            const usersLiked = sauce.usersLiked;
            const usersDisliked = sauce.usersDisliked;


            if (usersLiked.includes(userId) || usersDisliked.includes(userId)) {
                return res.status(400).json({ error: 'You like it already !' })
            }

            else {
                switch (req.body.like) {

                    case 1:
                        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: 1 }, $push: { usersLiked: userId } })
                            .then(() => res.status(200).json({ message: 'Like !' }))
                            .catch(error => res.status(400).json({ error }))
                        break;

                    case 0:
                        if (userLiked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: userId }, $inc: { likes: -1 } })
                                .then(() => res.status(200).json({ message: 'Liking no more !' }))
                                .catch(error => res.status(400).json({ error }))
                        }
                        else if (usersDisliked.includes(userId)) {
                            Sauce.updateOne({ _id: req.params.id }, { pull: { usersDisliked: userId }, $inc: { dislikes: -1 } })
                                .then(() => res.status(200).json({ message: 'Disliking no more !' }))
                                .catch(error => res.status(400).json({ error }))
                        }
                        break;

                    case -1:
                        Sauce.updateOne({ _id: req.params.id }, { $inc: { disLikes: -1 }, $push: { userLiked: userId } })
                            .then(() => res.status(200).json({ message: 'Like !' }))
                            .catch(error => res.status(400).json({ error }))
                        break;
                    default:
                        console.error('Error')
                }
            }
        })
        .catch(error => res.status(400).json({ error: 'CA MARCHE PAAAAAAAAS' }))
};





exports.likeSauce = (req, res, next) => {
    let like = req.body.like;
    let user = req.body.userId;
    let sauceId = req.params.id;

    switch (like) {
        case 1:
            Sauce.findOne({
                _id: sauceId
            })
                .then((sauce) => {
                    Sauce.updateOne({
                        _id: sauceId
                    }, {
                        $push:
                            { usersLiked: user },
                        $inc:
                            { likes: 1 },
                    })
                        .then(() => res.status(200).json({ message: 'Liker added, likes incremented ' }))
                        .catch((error) => res.status(400).json({ error }))
                })
                .catch((error) => res.status(404).json({ error }));
            break;
        case -1:
            Sauce.findOne({
                _id: sauceId
            })
                .then((sauce) => {
                    Sauce.updateOne({
                        _id: sauceId
                    }, {
                        $push:
                            { usersDisliked: user },

                        $inc:
                            { dislikes: 1 },
                    })
                        .then(() => res.status(200).json({
                            message: 'userDisliker added, dislikes incremented '
                        }))
                        .catch((error) => res.status(400).json({ error }))
                })
                .catch((error) => res.status(404).json({ error }))
            break;
        default:
            Sauce.findOne({
                _id: sauceId
            })
                .then((sauce) => {
                    if (sauce.usersLiked.includes(user)) {
                        Sauce.updateOne({
                            _id: sauceId
                        }, {
                            $pull:
                                { usersLiked: user },

                            $inc:
                                { likes: -1 },
                        })
                            .then(() => res.status(200).json({ message: 'Liker delete, likes decremented' }))
                            .catch((error) => res.status(400).json({ error }))
                    }
                    if (sauce.usersDisliked.includes(user)) {
                        Sauce.updateOne({
                            _id: sauceId
                        }, {
                            $pull:
                                { usersDisliked: user },

                            $inc:
                                { dislikes: -1 },
                        })
                            .then(() => res.status(200).json({
                                message: 'Disliker delete, dislikes decremented !'
                            }))
                            .catch((error) => res.status(400).json({
                                error
                            }))
                    }
                })
                .catch((error) => res.status(404).json({ error }));
    }
}


exports.likeSauce = (req, res, next) => {
    switch (req.body.like) {
        case 0:
            Sauce.findOne({ _id: req.params.id })
                .then((sauce) => {
                    if (sauce.usersLiked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { likes: -1 },
                            $inc: { dislikes: +1 },
                            $pull: { usersLiked: req.body.userId },
                            _id: req.params.id
                        })
                            .then(() => { res.status(201).json({ message: 'Like' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });

                    } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                        Sauce.updateOne({ _id: req.params.id }, {
                            $inc: { dislikes: -1 },
                            $inc: { likes: +1 },
                            $pull: { usersDisliked: req.body.userId },
                            _id: req.params.id
                        })
                            .then(() => { res.status(201).json({ message: 'Dislike' }); })
                            .catch((error) => { res.status(400).json({ error: error }); });
                    }
                })
                .catch((error) => { res.status(404).json({ error: error }); });
            break;
        case 1:
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { likes: +1 },
                $inc: { dislikes: -1 },
                $push: { usersLiked: req.body.userId },
                _id: req.params.id
            })
                .then(() => { res.status(201).json({ message: 'Like' }); })
                .catch((error) => { res.status(400).json({ error: error }); });
            break;
        case -1:
            Sauce.updateOne({ _id: req.params.id }, {
                $inc: { dislikes: +1 },
                $inc: { likes: -1 },
                $push: { usersDisliked: req.body.userId },
                _id: req.params.id
            })
                .then(() => { res.status(201).json({ message: 'Dislike' }) })
                .catch((error) => { res.status(400).json({ error: error }) });
            break;
        default:
            console.error('Error')
    }
};








exports.likeSauce = (req, res, next) => {
    if (req.body.like === 1) {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: req.body.like++ }, $push: { usersLiked: req.body.userId } })
            .then(sauce => res.status(200).json({ message: 'Like' }))
            .catch(error => res.status(400).json({ error }));
    } else if (req.body.like === -1) {
        Sauce.updateOne({ _id: req.params.id }, { $inc: { likes: (req.body.like--) }, $push: { usersLiked: req.body.userId } })
            .then(sauce => res.status(200).json({ message: 'Dislike' }))
            .catch(error => res.status(400).json({ error }));
    } else {

        Sauce.findOne({ _id: req.params.id })
            .then(sauce => {
                if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: +1 } })
                        .then(sauce => res.status(200).json({ message: 'Like' }))
                        .catch(error => res.status(400).json({ error }))
                } else if (sauce.usersLiked.includes(req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } })
                        .then(sauce => res.status(200).json({ message: 'Dislike' }))
                        .catch(error => res.status(400).json({ error }))
                }
            })
            .catch(error => res.status(400).json({ error }));
    }
};



---------------------------------------Autre méthode potentielle?


exports.likeSauce = (req, res, next) => {
    // const like = req.body.like
    // const user = req.body.userId
    // const sauceId = req.params.id

    if (like === 0) {
        Sauce.findOne({ _id: sauceId })
            .then((sauce) => {
                if (sauce.usersLiked.includes(user))
                    Sauce.updateOne({ _id: sauceId }, { $pull: { usersLiked: user }, $inc: { likes: -1 }, })
                        .then(() => res.status(200).json({ message: 'Like retiré !' }))
                        .catch((error) => res.status(400).json({ error }))
            })
        if (sauce.usersDisliked.includes(user))
            Sauce.updateOne({ _id: sauceId }, { $pull: { usersDisliked: user }, $inc: { dislikes: -1 }, })
                .then(() => res.status(200).json({
                    message: 'Dislike retiré !'
                }))
                .catch((error) => res.status(400).json({ error }))
    }
}








switch (req.body.like) {
    case 0:
        Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
                if (sauce.usersLiked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { likes: -1 },
                        $inc: { dislikes: +1 },
                        $pull: { usersLiked: req.body.userId },
                        _id: req.params.id
                    })
                        .then(() => { res.status(201).json({ message: 'Like' }); })
                        .catch((error) => { res.status(400).json({ error: error }); });

                } if (sauce.usersDisliked.find(user => user === req.body.userId)) {
                    Sauce.updateOne({ _id: req.params.id }, {
                        $inc: { dislikes: -1 },
                        $inc: { likes: +1 },
                        $pull: { usersDisliked: req.body.userId },
                        _id: req.params.id
                    })
                        .then(() => { res.status(201).json({ message: 'Dislike' }); })
                        .catch((error) => { res.status(400).json({ error: error }); });
                }
            })
            .catch((error) => { res.status(404).json({ error: error }); });
        break;
    case 1:
        Sauce.updateOne({ _id: req.params.id }, {
            $inc: { likes: +1 },
            $inc: { dislikes: -1 },
            $push: { usersLiked: req.body.userId },
            _id: req.params.id
        })
            .then(() => { res.status(201).json({ message: 'Like' }); })
            .catch((error) => { res.status(400).json({ error: error }); });
        break;
    case -1:
        Sauce.updateOne({ _id: req.params.id }, {
            $inc: { dislikes: +1 },
            $inc: { likes: -1 },
            $push: { usersDisliked: req.body.userId },
            _id: req.params.id
        })
            .then(() => { res.status(201).json({ message: 'Dislike' }) })
            .catch((error) => { res.status(400).json({ error: error }) });
        break;
    default:
        console.error('Error')
}
};*/