const authenticated = (req, res, next) => {
  if (req.isAuthenticate()) {
    return next()
  }
  req.flash('errMsg', '請先登入')
  return res.redirect('/signin')
}

module.exports = { authenticated }