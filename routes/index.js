const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp)
router.get('/signin', userController.signInPage)
router.post('/signin', passport.authenticate('local', {
  failureRedirect:'/signin', failureFlash: true }), userController.signIn)
router.get('/oauth/login/google', passport.authenticate('google', { scope: ['email', 'profile'] }))
router.get('/oauth/redirect/google', passport.authenticate('google', {
  failureRedirect: '/signin', failureFlash: true
}), userController.signIn)
router.get('/logout', userController.logout)

router.get('/', postController.home)

router.get('/', (req, res) => res.redirect('/'))

router.use('/', generalErrorHandler)

module.exports = router