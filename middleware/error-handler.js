module.exports = {
  generalErrorHandler (err, req, res, next) {
    if (err instanceof Error) {
      req.flash('errMsg', `${err.name}: ${err.message}`)
    } else {
      req.flash('errMsg', `${err}`)
    }
    res.redirect('back')
  }
}