function checkAuth(req, res, next) {
  if (req.isAuthenticated()) {
    req.flash('error', 'You are already logged in!');
    res.redirect('/mongoose');
  } else {
    next();
  }
}

module.exports = checkAuth;
