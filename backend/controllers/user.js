const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // algorithme de hash bcrypt sur 10 tours
        .then(hash => {
            const user = new User({ // crée un nouvel utilisateur
                email: req.body.email,
                password: hash // récupère le mdp hashé de la fonction au-dessus
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur Créé !' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))

}

exports.login = (req, res, next) => {
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) { // Si aucun utilisateur de la BDD ne correspond à cet utilisateur
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            bcrypt.compare(req.body.password, user.password) // Compare le mdp saisi au hash
                .then(valid => {
                    if (!valid) { // Si le mdp n'est pas conforme à celui enregistré en BDD
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            'RANDOM_TOKEN_SECRET',
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};