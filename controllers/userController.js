const { User, Post, Image, Like, Followship } = require('../models')
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
      const signInUser = req.user?.id
      const profileId = parseInt(req.params?.id)
      const profile = await User.findByPk(profileId , {
        attributes:['id', 'name', 'image'],
        include: [
          { model: User, as: 'Followers', attributes: ['id', 'name', 'image'],  },
          { model: User, as: 'Followings', attributes: ['id', 'name', 'image'] }
        ],
        nest: true
      })
      if (!profile) {
        req.flash('errMsg', '用戶不存在')
        return res.redirect('back')
      }
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
      const profileInfo = {
        ...profile.toJSON(),
        postsCount: postsInfo.length,
        followersCount: profile.Followers.length,
        followingsCount: profile.Followings.length,
        isFollowing: profile.Followers.map(f => f.id).includes(parseInt(signInUser))
      } 
      postsInfo.forEach(post => {
        post.images = post.images ? post.images.split(',') : []
      })
      
      return res.render('user/profile', { 
        profile : profileInfo,
        postsInfo,
        profileId,
        signInUser
      })
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
      return res.render('user/profileEdit', { user })
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
  },
  addLike: async (req, res, next) => {
    try {
      const { postId } = req.params
      await Like.create({
        postId,
        userId: req.user.id
      })
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  removeLike: async (req, res, next) => {
    try {
      const { postId } = req.params
      const like = await Like.findOne({
        where: {
          postId,
          userId: req.user.id
        }
      })
      await like.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  addFollow: async (req, res, next) => {
    try {
      const { userId } = req.params
      const followship = await Followship.findOne({
        where: { followerId: req.user.id, followingId: userId }
      })
      if (followship) throw new Error('已追蹤此使用者')
      await Followship.create({
        followingId: userId, 
        followerId: req.user.id
      })
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  removeFollow: async (req, res, next) => {
    try {
      const { userId } = req.params
      const followship = await Followship.findOne({
        where: { followerId: req.user.id, followingId: userId }
      })
      if (!followship) throw new Error('尚未追蹤此使用者')
      await followship.destroy()
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  getFollowings: async (req, res, next) => {
    try {
      const signInUser = req.user?.id 
      const profileUser = req.params.userId
      const followingInfo = await User.findByPk(profileUser, {
        include: [{
          model: User,
          as: 'Followings',
          attributes: ['id', 'name', 'image']
        }],
        nest: true
      })
      let userFollowArr = []
      if (signInUser) {
        const userFollowInfo = await User.findByPk(signInUser, {
          attributes: [],
          include: [{ model: User, as: 'Followings', attributes: ['id'] }],
          nest: true
        })
        userFollowArr = userFollowInfo.toJSON().Followings.map(f => f.id)
      }
      const followings = followingInfo?.toJSON().Followings.map(f => ({
        ...f,
        isFollowing: userFollowArr.includes(f.id)
      }))
      return res.render('user/followings', { followings, signInUser, profileUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  getFollowers: async (req, res, next) => {
    try {
      const signInUser = req.user?.id 
      const profileUser = req.params.userId
      const followerInfo = await User.findByPk(profileUser, {
        include: [{
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'image']
        }],
        nest: true
      })

      let userFollowArr = []
      if (signInUser) {
        const userFollowInfo = await User.findByPk(signInUser, {
          attributes: [],
          include: [{ model: User, as: 'Followings', attributes: ['id'] }],
          nest: true
        })
        userFollowArr = userFollowInfo.toJSON().Followings.map(f => f.id)
      }
      const followers = followerInfo?.toJSON().Followers.map(f => ({
        ...f,
        isFollowing: userFollowArr.includes(f.id)
      }))
      return res.render('user/followers', { followers, signInUser, profileUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = userController