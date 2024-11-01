const { User, Post, Image } = require('../models')
const bcrypt = require('bcryptjs')
const { fn, col } = require('sequelize')

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
        nest:true
      })
      postsInfo.forEach(post => {
        post.images = post.images ? post.images.split(',') : []
      })
      return res.render('profile', { profile, postAmount, postsInfo, profileId, singInUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = userController