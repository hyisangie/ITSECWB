module.exports = (req, res, next) => {
    if (!req.session.loginAttempts) req.session.loginAttempts = 0;

    if (req.session.loginAttempts >= 3) {
        req.flash('error', 'Too many login attempts. Please try again later.');
        return res.redirect('/');
    }

    next();
};
