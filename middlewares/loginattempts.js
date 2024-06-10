module.exports = (req, res, next) => {
    if (!req.session.loginAttempts) {
        req.session.loginAttempts = 0;
    }

    if (req.session.loginAttempts >= 3) {
        return res.status(403).send('Too many login attempts. Please try again later.');
    }

    next();
};
