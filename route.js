const express = require('express');
const router = express.Router();
const path = require('path');

const { upload , checkMagicNumber } = require('./middlewares/upload.js');
const loginAttempts = require('./middlewares/loginattempts.js');
const { checkAuth, isAuth } = require('./middlewares/session.js');

const user = require('./controller/user');

router.get('/register', user.render_register);
router.post('/register-user', upload, checkMagicNumber, user.create_user, (error, req, res, next) => {
    if (error) {
        req.flash('error', error.message);
        return res.redirect('/register');
    }
});

router.get('/', user.render_login);
router.post('/login-user', loginAttempts, user.login_user);

router.get('/profile', isAuth, user.render_profile);

router.get('/admin', checkAuth, user.render_admin);

router.get('/logout', user.logout_user);

module.exports = router;