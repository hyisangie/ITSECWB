exports.checkAuth = function(req, res, next){
    if (req.session.user) {
        if(req.session.user.role === 'admin') res.redirect('/admin');
        else if (req.session.user.role === 'user') res.redirect('/profile');
    }
    else res.redirect('/');// return next();
};

exports.isAuth = function(req, res, next){
    if(req.session.user) return next();
    else res.redirect('/');
};
