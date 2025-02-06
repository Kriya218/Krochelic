const { User, Post, Image, Followship, Subscribeship, Notice } = require('../models')
const bcrypt = require('bcryptjs')
const path = require('path')
// const redisClient = require('../config/redis')
const { fileHandler } = require('../helpers/file-helper')

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
    return res.redirect(`/home/${req.user.id}`)
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
      const profileId = Number(req.params?.id)
      const profileInfos = await User.findByPk(profileId , {
        attributes:['id', 'name', 'image'],
        include: [
          { model: User, as: 'Followers', attributes: ['id'] },
          { model: User, as: 'Followings', attributes: ['id'] },
          { 
            model: Post,
            attributes: ['id'],
            as: 'Posts',
            include: [{
              model: Image,
              attributes: ['path'],
              limit: 1
            }],
            nest: true
          },
        ],
        order: [[{ model: Post, as: 'Posts' }, 'createdAt', 'DESC']],
        nest: true
      })
      if (profileInfos.length === 0) throw new Error('用戶不存在')
      // const profileUserFollowingIds = await redisClient.sMembers(`user:${profileId}:followings`)
      // const signInUserFollowingIds = signInUser ? await redisClient.sMembers(`user:${signInUser}:followings`) : []
      const signInUserFollowingIds = signInUser ?
        await Followship.findAll({
          where: { followerId: signInUser },
          attributes: ['followingId'],
          raw: true
        }).then(followings => followings.map(following => following.followingId)) : []

      const subscribeShip = signInUser ? await Subscribeship.findOne({ 
          where: { 
            subscriberId: signInUser,
            subscribeId: profileId
          },
          raw: true
        }) : []
      const formatProfileInfo = {
        ...profileInfos.toJSON(),
        postsCount: profileInfos.Posts.length,
        postInfos: profileInfos.Posts.map(image => ({ id: image.id, path: image.Images[0].path })),
        followersCount: profileInfos.Followers.length,
        followingsCount: profileInfos.Followings.length,
        isFollowing: signInUserFollowingIds.includes(profileId),
        isSubscribe: subscribeShip ? true : false
      }
      return res.render('user/profile', { 
        profile: formatProfileInfo,
        profileId,
        signInUser
      })
    } catch (err) {
      console.log('Error:', err)
      return next(err)
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
      const  file  = req?.file
      if (!file) { console.log('未接收到圖片') }
      const [filePath, profileInfo] = await Promise.all([
        fileHandler(file),
        User.findByPk(req.user.id)
      ])

      if (!profileInfo) throw new Error('用戶不存在')
      await profileInfo.update({
        name,
        image: filePath || profileInfo.image
      })
      req.flash('編輯成功')
      return res.redirect(`/profile/${req.user.id}`)
    } catch (err) {
      console.error(err) 
      next(err)
    }
  },
  addFollow: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const { userId } = req.params
      const followship = await Followship.findOne({
        where: { followerId: signInUser, followingId: userId }
      })
      if (followship) throw new Error('已追蹤此使用者')
      await Followship.create({
        followingId: userId, 
        followerId: signInUser
      })
      // await redisClient.sAdd(`user:${signInUser}:followings`, userId, (err, res) => {
      //   if (err) return next(err)
      //   console.log('Add followings to cache:', res)
      // })
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  removeFollow: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const { userId } = req.params
      const followship = await Followship.findOne({
        where: { followerId: signInUser, followingId: userId }
      })
      if (!followship) throw new Error('尚未追蹤此使用者')
      await followship.destroy()
      // await redisClient.sRem(`user:${signInUser}:followings`, userId, (err, res) => {
      //   if (err) return next(err)
      //   console.log('Remove following from cache:', res)
      // })
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  getFollowings: async (req, res, next) => {
    try {
      const signInUser = req.user?.id 
      const profileId = req.params.userId
      if (!profileId) throw new Error('用戶不存在')
      // const signInUserFollowingIds = signInUser ? await redisClient.sMembers(`user:${signInUser}:followings`) : []
      const followingInfo = await User.findByPk(profileId, {
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
        isFollowing: userFollowArr.includes((f.id).toString())
      }))
      return res.render('user/followings', { followings, signInUser, profileId })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  getFollowers: async (req, res, next) => {
    try {
      const signInUser = req.user?.id 
      const profileUser = req.params.userId
      if (!profileUser) throw new Error('用戶不存在')
      // const signInUserFollowingIds = signInUser ? await redisClient.sMembers(`user:${signInUser}:followings`) : [] 
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
        isFollowing: userFollowArr.includes((f.id).toString())
      }))
      return res.render('user/followers', { followers, signInUser, profileUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  addSubscribe: async (req, res, next) => {
    try {
      const { subscribeId } = req.params
      const [subscribeUser, subscribeShip] =  await Promise.all([
        User.findByPk(subscribeId),
        Subscribeship.findOne({
          where: { subscribeId, subscriberId: req.user.id }
        })
      ])
      const description = '訂閱了你的帳號'
      if (!subscribeUser) return next(new Error('用戶不存在'))
      if (subscribeShip) return next(new Error('已訂閱此作者'))
      await Promise.all([
        Subscribeship.create({
          subscribeId,
          subscriberId: req.user.id
        }),
        Notice.create({
          userId: req.user.id,
          description,
          isRead: false,
          notifyId: subscribeId
        })
      ])
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  deleteSubscribe: async (req, res, next) => {
    try {
      const { subscribeId } = req.params
      const [subscribeUser, subscribeShip] = await Promise.all([
        User.findByPk(subscribeId),
        Subscribeship.findOne({
          where: {
            subscriberId: req.user.id,
            subscribeId
          }
        })
      ])
      if (!subscribeUser) return next(new Error('用戶不存在'))
      if (!subscribeShip) return next(new Error('尚未訂閱此用戶'))
      await Promise.all([
        Notice.destroy({
          where: {
            userId: req.user.id,
            notifyId: subscribeId
          }
        }),
        subscribeShip.destroy()
      ])
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = userController