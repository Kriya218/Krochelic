const { User } = require('../models')
const bcrypt = require('bcryptjs')
const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body
    if (password !== passwordConfirm) throw new Error('密碼與驗證密碼不一致')
    User.findOne({
      where: { email }
    })
      .then(user => {
        if (user) throw new Error('此Email已註冊')
        return bcrypt.hash(password, 10)
      })
      .then(hashedpPwd => User.create({
          name,
          password: hashedpPwd,
          email,
          image: '/images/default-profile.png'
        })
      .then(() => {
        req.flash('successMsg', '註冊成功!')
        res.redirect('/signin')
      })
      .catch(err => next(err))
      )
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res, next) => {
    console.log('LOGIN SUCCESS!')
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
  
}

module.exports = userController