const Sauce = require('../models/sauce');


exports.getAllSauces = (req, res, next) => {
    Sauce.find()
        .then(sauces => res.status(200).json(sauces))
        .catch(error => res.status(400).json({ error }))
};

exports.getOneSauce = (req, res, next) => {
    Sauce.findOne({ _id: req.params.id })
        .then(sauce => res.status(200).json(sauce))
        .catch(error => res.status(404).json({ error }));
};

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

exports.deleteSauce = (req, res, next) => {
    Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: 'Sauce supprimée' }))
        .catch(error => res.status(400).json({ error }));
};

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








/*
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



/* ---------------------------------------Autre méthode potentielle?


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


*/