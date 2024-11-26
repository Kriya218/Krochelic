const path = require('path') // don't delete
const { User, Post, Category, Image, Comment, Like, Subscribeship, Notice } = require('../models')


const postController = {
  feeds: async (req, res, next) => {
    // like ship??
    try {
      const signInUser = req.user?.id
      const categoryId = Number(req.query.categoryId) || ''
      const categories = await Category.findAll({
        attributes:['id', 'name'],
        raw: true
      })
      const posts = await Post.findAll({
        where: { ...categoryId ? { categoryId } : {} },
        attributes: ['id', 'title', 'userId', 'categoryId', 'createdAt'],
        include: [
          {
            model: Image,
            limit: 1
          },
          {
            model: Category,
            attributes: ['name'],
            raw: true
          }
        ],
        limit: 12,
        order: [['createdAt', 'DESC']],
        nest: true
      })
      const formatPosts = posts.map(post => ({
        ...post.toJSON(),
        image: post.Images[0].path,
      }))
      
      return res.render('feeds', { posts: formatPosts, signInUser, categories, categoryId })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  home: async (req, res, next) => {
    try {
      const signInUser = req.user.id
      if (signInUser !== Number(req.params.userId)) {
        req.flash('errMsg', '無檢視權限')
        return res.redirect('back')
      }
      
      const subscribes = await Subscribeship.findAll({
        where: { subscriberId: signInUser },
        attributes: ['subscribeId'],
        raw: true
      }).then(subs => subs.map(sub => sub.subscribeId))

      const posts = await Post.findAll({
        where: { userId: subscribes },
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
            whee: { userId: signInUser },
            attributes: ['userId'],
          }
        ],
        limit: 12,
        order: [['createdAt', 'DESC']],
        nest: true
      })
      const formatPosts = posts.map(post => ({
        ...post.toJSON(),
        image: post.Images[0].path,
        isLiked: post.Likes.some(like => like.userId === signInUser)
      }))
      
      return res.render('home', { signInUser, posts: formatPosts })
    } catch (err) {
      console.log('Error:', err)
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
              include: [{ model: User, attributes: ['id','name', 'image'] }]
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
      const formatPostInfo = postInfo.toJSON()
      const isLiked = signInUser ? !!(await Like.findOne({ where: { postId, userId: signInUser }})) : false
      
      return res.render('posts/post', { postInfo: formatPostInfo, images, isLiked, signInUser, likes })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  postPost: async (req, res, next) => {
    try {
      const { title, categoryId, content } = req.body
      const userId = req.user.id
      const images = req?.files.map(file => {
        return path.posix.join('upload', file.filename)
      })
      
      const subscribeships = await Subscribeship.findAll({
        where: { subscribeId: userId },
        raw: true
      })
      const newPost = await Post.create({
        title,
        categoryId,
        content,
        userId
      })
      
      if (images && images.length > 0) {
        const imageInfos = images.map(img => {
          return {
            postId: newPost.id,
            path: img
          }
        })
        await Image.bulkCreate(imageInfos)
      }
      
      if (subscribeships.length > 0) {
        await Promise.all(
          subscribeships.map(subscribe => {
            const subscriberId = subscribe.subscriberId
            return Notice.create({
              userId,
              description: `發布了新貼文${title}`,
              postId: newPost.id,
              isRead: false,
              notifyId: subscriberId
            })
          })
        )
          .then(() => {
            req.flash('successMsg', '貼文上傳成功')
            return res.redirect(`/profile/${req.user.id}`)
          })
          .catch(err => {
            console.log('Error:', err)
            next(err)
          })
      }
    } catch (err) {
      console.log('ERROR:', err)
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
      console.log('Error:',err)
      next(err)
    }
  },
  putPost: async (req, res, next) => {
    try {
      const { title, categoryId, content } = req.body
      const postId = req.params.id
      const postInfo = await Post.findByPk(postId)
      await postInfo.update({ title, categoryId, content })
      req.flash('successMsg', '貼文編輯成功')
      return res.redirect(`/posts/${postId}`)
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  deletePost: async (req, res, next) => {
    try {
      const postId = req.params.id
      const post = await Post.findByPk(postId)
      if (!post) throw new Error('貼文不存在')
      if (post.userId !== req.user.id) throw new Error('無刪除權限')
      await post.destroy()
      req.flash('successMsg', '貼文刪除成功')
      return res.redirect(`/profile/${req.user.id}`)
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  addLike: async (req, res, next) => {
    try {
      const { postId } = req.params
      const postInfo = await Post.findByPk(postId, {
        attributes: ['userId', 'title'],
        raw: true
      })
      const like = await Like.create({
        postId,
        userId: req.user.id
      })
      console.log('like:', like.id)
      if (req.user.id === postInfo.userId) return
      
      await Notice.create({
        userId: req.user.id,
        description: `按讚了你的貼文${postInfo.title}`,
        postId,
        likeId: like.id,
        isRead: false,
        notifyId: postInfo.userId
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
        },
        attributes: ['id'],
        raw: true
      })
      
      await Notice.destroy({ where: { likeId: like.id } })
      await Like.destroy({ where: { id: like.id } })
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
}

module.exports = postController