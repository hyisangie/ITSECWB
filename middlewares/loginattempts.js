module.exports = (req, res, next) => {
    if (!req.session.loginAttempts) req.session.loginAttempts = 0;

    const now = Date.now();
    const loginAttemptLimit = 2;
    const lockoutTime = 30 * 1000; // 30 seconds
    console.log("attempt " + req.session.loginAttempts)
    if (req.session.loginAttempts >= loginAttemptLimit) {
        const timeSinceLastAttempt = now - req.session.lastLoginAttempt;

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
