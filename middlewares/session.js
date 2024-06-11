exports.checkAuth = function(req, res, next){
    if (req.session.user) {
        if(req.session.user.role === 'admin') return next();
        else if (req.session.user.role === 'user') res.redirect('/profile');
    }
    else res.redirect('/');// return next();
};

exports.isAuth = function(req, res, next){
    if(req.session.user) return next();
    else res.redirect('/');
};
exports.checkAuthinLogin = function (req, res, next) {
    if (req.session.user) {
      res.redirect("/");
    } else {
      next();
    }
  };