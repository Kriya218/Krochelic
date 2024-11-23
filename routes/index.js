const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const { authenticated } = require('../middleware/auth')
const upload = require('../middleware/multer')
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const commentController = require('../controllers/commentController')
const noticeController = require('../controllers/noticeController')
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

router.get('/posts/:id/edit', authenticated, postController.editPost)
router.put('/posts/:id', authenticated, postController.putPost)
router.delete('/posts/:id', authenticated, postController.deletePost)
router.get('/posts/create', authenticated, postController.createPost)
router.post('/posts', authenticated, upload.array('images', 4), postController.postPost)
router.get('/posts/:id', postController.getPost)

router.post('/comments', authenticated, commentController.postComment)
router.delete('/comments/:id', authenticated, commentController.deleteComment)

router.post('/like/:postId', authenticated, postController.addLike)
router.delete('/like/:postId', authenticated, postController.removeLike)

router.post('/following/:userId', authenticated, userController.addFollow)
router.delete('/following/:userId', authenticated, userController.removeFollow)
router.get('/followings/:userId', userController.getFollowings)
router.get('/followers/:userId', userController.getFollowers)

router.post('/subscribe/:subscribeId', authenticated, userController.addSubscribe)
router.delete('/subscribe/:subscribeId', authenticated, userController.deleteSubscribe)

router.get('/profile/:id/edit', authenticated, userController.editProfile)
router.put('/profile/:id', authenticated, upload.single('image'), userController.putProfile)
router.get('/profile/:id', userController.profile)

router.get('/notice/:userId', authenticated, noticeController.getNotice)

router.get('/', postController.home)


router.get('/', (req, res) => res.redirect('/'))

router.use('/', generalErrorHandler)

module.exports = router