/* ------------------------------ Libraries ------------------------------ */

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config()

/* ------------------------------ Routes ------------------------------ */

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

/* ------------------------------ Server Connexion ------------------------------ */

mongoose.connect(process.env.mongoDBUrl,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use(async (req, res, next) => {
    if (req.headers["x-access-token"]) {
        const accessToken = req.headers["x-access-token"];
        const { userId, exp } = await jwt.verify(accessToken, process.env.JWT_SECRET);
        // Check if token has expired
        if (exp < Date.now().valueOf() / 1000) {
            return res.status(401).json({
                error: "JWT token has expired, please login to obtain a new one"
            });
        }
        res.locals.loggedInUser = await User.findById(userId);
        next();
    } else {
        next();
    }
});

module.exports = app;