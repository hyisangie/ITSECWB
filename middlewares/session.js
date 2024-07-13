exports.checkAuth = function(req, res, next){
    if (req.session.user) {
        if(req.session.user.role === 'admin') return next();
        else if (req.session.user.role === 'user') res.redirect('/profile');
    }
    else res.redirect('/');// return next();
};

exports.isAuth = function(req, res, next){
  if (req.session.user) {
      next();
  } else {
      req.flash('error', 'Please login first!');
      res.redirect('/login');
  }
};

exports.checkAuthinLogin = function(req, res, next){
  if (!req.session.user) {
      next();
  } else {
    res.redirect("/applications")
  }
};

const SESSION_TIMEOUT = 0.25 * 60 * 1000;

exports.checkSessionTimeout = function(req, res, next){
  if (req.session.user) {
    const now = new Date().getTime();
    const lastActivity = req.session.lastActivity || now;

    if (now - lastActivity > SESSION_TIMEOUT) {
        // Session has expired
        delete req.session.user;
        req.flash('error', 'Your session has expired. Please log in again.');
        return res.redirect('/login');
    }

    // Update last activity time
    req.session.lastActivity = now;
  }
  next();
};