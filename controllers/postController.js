const path = require('path') // don't delete
const { User, Post, Category, Image, Comment, Like, Subscribeship, Notice, Followship } = require('../models')
const Op = require ('sequelize').Op 
const { fn, col, literal } = require('sequelize')
const { getOffset, getPagination } = require('../helpers/paginationHelpers')
// const redisClient  = require('../config/redis')
const { fileHandler } = require('../helpers/file-helper')

const postController = {
  feeds: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const categoryId = Number(req.query.categoryId) || null
      const page = Number(req.query.page) || 1
      const limit = 20
      const offset = getOffset(limit, page)
      const keywords = req.query.keywords?.trim().toLowerCase() || null
      const search = keywords ? {
        [Op.or]: [
          { title: { [Op.like]: `%${keywords}%`} },
          { content: { [Op.like]: `%${keywords}%`} },
        ]
      } : {}
      
      const cacheKey = signInUser ? 
        `feeds:${signInUser}:${categoryId || 'all'}:${page}:${keywords || 'all'}` : 
        `feeds:guest:${categoryId || 'all'}:${page}:${keywords || 'all'}`

      
      // const cachedFeeds = await redisClient.get(cacheKey)
      // if (cachedFeeds) {
      //   console.log('使用 Redis 快取結果')
      //   return res.render('feeds', JSON.parse(cachedFeeds))
      // }

      const categories = await Category.findAll({
        attributes:['id', 'name'],
        raw: true
      })
      const likeIds = signInUser ? (await Like.findAll({
          where: { userId: signInUser },
          attributes: ['postId'],
          raw: true
      })).map(like => like.postId) : []
      
      const whereCondition = { 
        ...categoryId ? { categoryId } : {},
        ...search
      }
      const { count: postCounts, rows: posts } = await Post.findAndCountAll({
        where: whereCondition,
        attributes: ['id', 'title', 'userId', 'categoryId', 'createdAt'],
        include: [
          { model: Image, limit: 1},
          { model: Category, attributes: ['name'], raw: true }
        ],
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        nest: true
      })
      
      let postsResult
      if (keywords && posts.length === 0) {
        postsResult = 'Not found'
      } else {
        postsResult = posts.map(post => ({
          ...post.toJSON(),
          image: post.Images[0].path,
          isLiked: likeIds.includes(post.id)
        }))
      }

      const responseData = {
        posts: postsResult,
        signInUser,
        categories,
        categoryId,
        pagination: getPagination(limit, page, postCounts)
      }
      // await redisClient.set(cacheKey, JSON.stringify(responseData), { EX: 60 })
      return res.render('feeds', responseData)
    } catch (err) {
      console.error('Feed page error:', err)
      next(err)
    }
  },
  home: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      if (signInUser !== Number(req.params.userId)) {
        return next(new Error('無檢視權限'))
      }
      
      // const followingIds = await redisClient.sMembers(`user:${signInUser}:followings`)
      const followingIds = await Followship.findAll({
        where: { followerId: signInUser },
        attributes: ['followingId'],
        raw: true
      }).then(followings => followings.map(following => following.followingId))
      const posts = await Post.findAll({
        where: { userId: followingIds },
        attributes: ['id', 'title', 'userId', 'categoryId', 'createdAt'],
        include: [
          {
            model: Image,
            limit: 1
          },
          {
            model: User,
            attributes: ['id', 'name', 'image'],
          },
          {
            model: Like,
            where: { userId: signInUser },
            attributes: ['userId'],
            required: false
          }
        ],
        limit: 12,
        order: [['createdAt', 'DESC']],
        nest: true
      })
      const formatPosts = posts.map(post => ({
        ...post.toJSON(),
        image: post.Images[0]?.path,
        isLiked: post.Likes.some(like => like.userId === signInUser)
      }))
      
      return res.render('home', { signInUser, posts: formatPosts })
    } catch (err) {
      console.error('Home page err:', err)
      next(err)
    }
  },
  popular: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const limit = 20
      const populars = await Like.findAll({
        attributes: [
          'postId',
          [fn('COUNT', col('post_id')), 'likeCount']
        ],
        group: ['postId'],
        order: [[literal('likeCount'), 'DESC']],
        limit,
        raw: true
      })
      const postsIdArr = populars.map(popular => popular.postId)
      const postsInfo = await Post.findAll({
        where: { id: postsIdArr },
        attributes: ['id', 'title', 'categoryId', 'userId'],
        include: [
          {
            model: Image,
            limit: 1
          },
          {
            model: Category,
            attributes: ['name']
          },
          {
            model: Like,
            attributes: ['userId']
          }
        ],
        nest: true
      })
      const formatPostInfo = postsInfo.map(info => ({
        ...info.toJSON(),
        image: info.Images[0].path,
        isLiked: info.Likes.some(like => like.userId === signInUser),
        likeCounts: info.Likes.length
      }))
      const postInfoMap = formatPostInfo.reduce((map, post) => {
        map[post.id] = post
        return map
      }, {})
      const sortedPostInfo = postsIdArr.map(id => postInfoMap[id])
      res.render('popular', { posts: sortedPostInfo, signInUser })
    } catch (err) {
      console.error('Popular page error:', err)
      next(err)
    }
  },
  createPost: async(req, res, next) => {
    try {
      const categories = await Category.findAll({
        attributes: ['id', 'name'],
        raw: true
      })
      return res.render('posts/postCreate', { categories } )
    } catch (err) {
      console.error('Create post page error:', err)
      next(err)
    }
  },
  getPost: async (req, res, next) => {
    try {
      const signInUser = Number(req.user?.id)
      const postId = req.params.id
      const [postInfo, images, likes] = await Promise.all([
        Post.findByPk(postId, {
          attributes: ['id', 'title', 'categoryId','content', 'userId'],
          include: [
            { model: User, attributes: ['name', 'image'] },
            { model: Category, attributes:['name'] },
            {
              model: Comment,
              attributes: ['id', 'content', 'userId'],
              include: [{ model: User, attributes: ['id','name', 'image'] }],
              required: false
            }
          ],
          order: [[{ model: Comment }, 'createdAt', 'DESC']],
          nest: true
        }),
        Image.findAll({
          where: { postId },
          attributes: ['id', 'path'],
          raw: true
        }),
        Like.count({ where: {postId} })
      ])
      if (!postInfo) {
        const err = new Error('貼文不存在')
        return next(err)
      }
      const formatPostInfo = postInfo.toJSON()
      const isLiked = signInUser ? !!(await Like.findOne({ where: { postId, userId: signInUser }})) : false
      return res.render('posts/post', { postInfo: formatPostInfo, images, isLiked, signInUser, likes })
    } catch (err) {
      console.error('Post page error:', err)
      next(err)
    }
  },
  postPost: async (req, res, next) => {
    try {
      const files = await req?.files
      const { title, categoryId, content } = req.body
      const signInUser = req.user.id
      const images = await fileHandler(files)
      if (images.length === 0 ) throw new Error('Images upload error')
      const [subscribeships, newPost] = await Promise.all([
        Subscribeship.findAll({
          where: { subscribeId: signInUser },
          raw: true
        }),
        Post.create({
          title,
          categoryId,
          content,
          userId: signInUser
        })
      ])
      if (images.length > 0) {
        let imageInfos
        if (typeof images === 'string') {
          imageInfos = [{ postId: newPost.id, path: images }]
        } else {
          imageInfos = images.map(img => ({
            postId: newPost.id,
            path: img
          }))
        }
        await Image.bulkCreate(imageInfos)
      }
      // await Promise.all([
      //   redisClient.del(`feeds:${signInUser}:all:1:all`),
      //   redisClient.del(`feeds:guest:all:1:all`)
      // ])
      if (subscribeships.length === 0) {
        req.flash('successMsg', '貼文上傳成功')
        return res.redirect(`/profile/${req.user.id}`)
      }
      if (subscribeships.length > 0) {
        await Promise.all(
          subscribeships.map(subscribe => {
            const subscriberId = subscribe.subscriberId
            return Notice.create({
              userId: signInUser,
              description: `發布了新貼文${title}`,
              postId: newPost.id,
              isRead: false,
              notifyId: subscriberId
            }).catch(err => {
                console.error('Create subscribe notice error:', err)
                next(err)
              })
          })
        )
          .then(() => {
            req.flash('successMsg', '貼文上傳成功')
            return res.redirect(`/profile/${req.user.id}`)
          })
      }
    } catch (err) {
      console.error('Post post error:', err)
      next(err)
    }
  },
  editPost: async (req, res, next) => {
    try {
      const postsId = req.params.id
      const postInfo = await Post.findByPk(postsId, {
        attributes: ['id', 'title', 'categoryId', 'content', 'userId'],
        raw: true
      })
      const categories = await Category.findAll({
        attributes: ['id', 'name'],
        raw: true
      })
      if (postInfo.userId !== req.user.id) throw new Error('無編輯權限')
      return res.render('posts/postEdit', { postInfo, categories })
    } catch (err) {
      console.error('Edit post error:',err)
      next(err)
    }
  },
  putPost: async (req, res, next) => {
    try {
      const { title, categoryId, content } = req.body
      const postId = req.params.id
      const postInfo = await Post.findByPk(postId)
      if (!postInfo) throw new Error('貼文不存在')
      await postInfo.update({ title, categoryId, content })
      req.flash('successMsg', '貼文編輯成功')
      return res.redirect(`/posts/${postId}`)
    } catch (err) {
      console.error('Put post error:', err)
      return next(err)
    }
  },
  deletePost: async (req, res, next) => {
    try {
      const postId = req.params.id
      const postInfo = await Post.findByPk(postId)
      if (!postInfo) throw new Error('貼文不存在')
      if (postInfo.userId !== req.user.id) throw new Error('無刪除權限')
      await postInfo.destroy()
      await Notice.destroy({ where: { postId } })
      req.flash('successMsg', '貼文刪除成功')
      return res.redirect(`/profile/${req.user.id}`)
    } catch (err) {
      console.error('Delete post error:', err)
      return next(err)
    }
  },
  addLike: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const { postId } = req.params
      const [postInfo, likeShip] = await Promise.all([
        Post.findByPk(postId, {
          attributes: ['userId', 'title'],
          raw: true
        }),
        Like.findOne({
          where: {
            postId,
            userId: req.user.id
          },
          attributes: ['id'],
          raw: true
        })
      ])
      if (likeShip) throw new Error('已按讚過此篇貼文')
      const like = await Like.create({
        postId,
        userId: req.user.id
      })
      if (req.user.id === postInfo.userId) return res.redirect('back')
      
      await Notice.create({
        userId: req.user.id,
        description: `按讚了你的貼文${postInfo.title}`,
        postId,
        likeId: like.id,
        isRead: false,
        notifyId: postInfo.userId
      })
      // const keysToDelete = await redisClient.keys(`feeds:${signInUser}:*`)
      // if (keysToDelete.length > 0) {
      //   await redisClient.del(keysToDelete)
      // }
      
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  removeLike: async (req, res, next) => {
    const { postId } = req.params
    const signInUser = req.user?.id
    try {
      const likeShip = await Like.findOne({
        where: {
          postId,
          userId: signInUser
        },
        attributes: ['id'],
        raw: true
      })
      if (!likeShip) throw new Error('尚未按讚此篇貼文')
      await Like.destroy({ where: { id: likeShip.id } })
      await Notice.destroy({ where: { likeId: likeShip.id } })

      // const keysToDelete = await redisClient.keys(`feeds:${signInUser}:*`)
      // if (keysToDelete.length > 0) {
      //   await redisClient.del(keysToDelete)
      // }
      
      return res.redirect('back')
    } catch (err) {
      console.error('Remove like error:', err)
      next(err)
    }
  },
}

module.exports = postController
