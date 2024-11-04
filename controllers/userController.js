const { User, Post, Image } = require('../models')
const bcrypt = require('bcryptjs')
const { fn, col } = require('sequelize')
const path = require('path')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: async (req, res, next) => {
    try {
      const { name, email, password, passwordConfirm } = req.body
      if (password !== passwordConfirm) throw new Error('密碼與驗證密碼不一致')
      const user = await User.findOne({where: { email }})
      if (user) throw new Error('此Email已註冊')
      const hashedPwd = await bcrypt.hash(password, 10)
      await User.create({
        name,
        password: hashedPwd,
        email,
        image: '/images/default-profile.png'
      })
      req.flash('successMsg', '註冊成功!')
      return res.redirect('/signin')
    } catch (err) {
      next(err)
    }
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    req.flash('successMsg', '登入成功')
    return res.redirect('/')
  },
  logout: (req, res) => {
    req.logout(err => {
      if (err) return next(err)
      req.flash('successMsg', '登出成功')
      return res.redirect('/')
    })
  },
  profile: async(req, res, next) => {
    try {
      const singInUser = req.user?.id
      const profileId = parseInt(req.params?.id)
      const profile = await User.findByPk(profileId , {
        attributes:['id', 'name', 'image'],
        raw: true,
      })
      const postAmount = await Post.count({ where: { userId: profileId } })
      const postsInfo = await Post.findAll({
        where: { userId: profileId },
        include: [{
          model: Image,
          attributes: []
        }],
        attributes: [
          'id',
          [fn('GROUP_CONCAT', col('Images.path')), 'images']
        ],        
        group: ['Post.id'],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      })
      postsInfo.forEach(post => {
        post.images = post.images ? post.images.split(',') : []
      })
      return res.render('profile', { profile, postAmount, postsInfo, profileId, singInUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  editProfile: async (req, res, next) => {
    try {
      const userId = req.user.id
      const user = await User.findByPk(userId,{
        attributes: ['id', 'name', 'image'],
        raw: true
      })
      if (userId !== parseInt(req.params.id)) throw new Error('無編輯權限')
      return res.render('profileEdit', { user })
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
  putProfile: async (req, res, next) => {
    try {
      const { name } = req.body
      const file = req.file
      console.log("file:", req.file)
      const filePath = file ? path.posix.join('upload', file.filename) : null
      const profileInfo = await User.findByPk(req.user.id)
      await profileInfo.update({
        name,
        image: filePath || profileInfo.image
      })
      req.flash('編輯成功')
      return res.redirect(`/profile/${req.user.id}`)
    } catch (err) {
      console.log(err)
      next(err)
    }
  }
}

module.exports = userController