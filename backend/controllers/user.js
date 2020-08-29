const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

function maskEmail(email) {
    function mask(str) {
        if (str.length > 4) {
            return str.substr(0, 1) + str.substr(1, str.length - 1).replace(/\w/g, '*') + str.substr(-1, 1);
        }
        return str.replace(/\w/g, '*');
    }
    return email.replace(/([\w.]+)@([\w.]+)(\.[\w.]+)/g, function (m, p1, p2, p3) {
        return mask(p1) + '@' + mask(p2) + p3;
    })
    return email;
}

exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10) // algorithme de hash bcrypt sur 10 tours
        .then(hash => {
            const user = new User({ // crée un nouvel utilisateur
                email: maskEmail(req.body.email),
                password: hash // récupère le mdp hashé de la fonction au-dessus
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur Créé !' }))
                .catch(error => res.status(400).json({ error }))
        })
        .catch(error => res.status(500).json({ error }))

}

exports.login = (req, res, next) => {
    User.findOne({ email: maskEmail(req.body.email) })
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