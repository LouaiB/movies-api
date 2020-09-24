const express = require('express');
const User = require('../jwt/models/User');
const Refresh = require('../jwt/models/Refresh');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const { ensureAuthenticated } = require('../jwt/auth.middleware');
const router = express.Router();

router.post('/register', async (req, res) => {
    try{
        const { email, username, password, roles } = req.body;
        let errors = [];
    
        // TODO: Validation
        if(!email) errors.push('email required');
        if(!username) errors.push('username required');
        if(!password) errors.push('password required');
    
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            console.log('no validation error');
            // Check if unique email
            if(await User.exists({ email })){
                return res.status(400).json({ message: 'Email already taken.' });
            } else {
                console.log('create new');
                const newUser = new User({ email, password, username, roles });
    
                // Hash Password
                newUser.password = bcrypt.hashSync(newUser.password);
                console.log('hashed');
                newUser.save()
                    .then(user => {
                        res.json(user);
                    })
                    .catch(err => res.status(500).json({ message: 'Failed to add user to database.' }));
            }
        }

    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
});


router.post('/login', async (req, res) => {
    try{
        const { username, password } = req.body;
        let errors = [];
    
        // TODO: Validation
        if(!username) errors.push('username required');
        if(!password) errors.push('password required');
        
        if(errors.length > 0){
            return res.status(400).json({ message: 'One or more validation errors occured.', errors });
        } else {
            // Check if correct
            const user = await User.findOne({ username });
            
            if(!(user && bcrypt.compareSync(password, user.password))){
                return res.status(400).json({ message: 'Invalid login.' });
            } else {
                // Generate Tokens
                const accessToken = generateAccessToken(user);
                const refreshToken = generateRefreshToken(user);
    
                // Save refresh token into refresh collection
                const dbRefreshToken = new Refresh({ token: refreshToken });
                dbRefreshToken.save();
    
                return res.json({ accessToken, refreshToken });
            }
        }
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/refresh', async (req, res) => {
    try{
        const refreshToken = req.body.refreshToken;
    
        if(!refreshToken) return res.sendStatus(400);
        if(!await Refresh.exists({ token: refreshToken })) return res.sendStatus(477);
    
        jwt.verify(refreshToken, config.REFRESH_TOKEN_SECRET, async (err, user) => {
            if(err) return res.sendStatus(477);

            const dbUser = await User.findById(user._id);
            if(!dbUser) return res.sendStatus(477);

            const accessToken = generateAccessToken(dbUser);
            return res.json({ accessToken });
        })
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
});

router.post('/logout', async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if(!refreshToken) return res.sendStatus(401);

        await Refresh.deleteOne({ token: refreshToken });

        return res.sendStatus(204);
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
    
});

router.get('/userData', ensureAuthenticated, async (req, res) => {
    try{
        const user = {
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email,
            createdOn: req.user.createdOn,
            roles: req.user.roles
        }
        res.json(user);
    } catch(err) {
        return res.status(500).json({ message: err.message });
    }
});

function generateAccessToken(user){
    return jwt.sign({ _id: user._id, username: user.username, roles: user.roles }, config.ACCESS_TOKEN_SECRET, { expiresIn: config.accessTokenLifespan });
}

function generateRefreshToken(user){
    return jwt.sign({ _id: user._id }, config.REFRESH_TOKEN_SECRET);
}

module.exports = router;