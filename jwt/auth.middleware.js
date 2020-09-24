const jwt = require('jsonwebtoken');
const config = require('../config');

module.exports = {

    ensureAuthenticated: (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return res.sendStatus(401);
        const token = authHeader.split(' ')[1];
        if(!token) return res.sendStatus(401);

        jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.sendStatus(401);
            req.user = user;
            next();
        })
    },

    ensureHasRoles: (roles) => (req, res, next) => {
        const authHeader = req.headers['authorization'];
        if(!authHeader) return res.sendStatus(401);
        const token = authHeader.split(' ')[1];
        if(!token) return res.sendStatus(401);

        if(!token) return res.sendStatus(401);

        jwt.verify(token, config.ACCESS_TOKEN_SECRET, (err, user) => {
            if(err) return res.sendStatus(401);

            // Check Roles
            let valid = true;
            roles.forEach(role => {
                if(!user.roles.includes(role)){
                    valid = false;
                }
            });

            if(!valid){
                res.sendStatus(403);
            } else {
                req.user = user;
                next();
            }
        })
    }

}