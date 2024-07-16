const Users = require('../models/user')

module.exports = (req, res, next) => {
    if (!req.session.loginAttempts) req.session.loginAttempts = 0;

    const now = Date.now();
    const loginAttemptLimit = 2;
    const attemptLimitNum = 3;
    const lockoutTime = 30 * 1000; // 30 seconds
    console.log("attempt " + req.session.loginAttempts)
    if (req.session.loginAttempts >= loginAttemptLimit) {
        const timeSinceLastAttempt = now - req.session.lastLoginAttempt;
        req.session.attemptLimitHit += 1;

        if (req.session.attemptLimitHit >= attemptLimitNum) {
            Users.lock_user(req.body.email)
                .then(() => {
                    req.flash('error', 'Your account has been locked. Please contact your administrator.');
                    res.redirect('/');
                })
                .catch(err => {
                    console.error('Error locking user:', err);
                    req.flash('error', 'Your account has been locked. Please contact your administrator');
                    res.redirect('/');
                });
        }
        if (timeSinceLastAttempt < lockoutTime) {
            req.flash('error', 'Too many login attempts. Please try again after 30 secounds.');
            return res.redirect('/');
        } else {
            // Reset login attempts after lockout time has passed
            req.session.loginAttempts = 0;
            req.session.lastLoginAttempt = null;
        }
    }

    // Update the last login attempt time
    req.session.lastLoginAttempt = now;
    next();
};
