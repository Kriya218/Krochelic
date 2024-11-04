const path = require('path')
const { User, Post, Category, Image, Comment } = require('../models')


const postController = {
  home: (req, res, next) => {
    try {
      const userId = req.user?.id
      return res.render('home', { userId })
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
      return res.render('postCreate', { categories } )
    } catch (err) {
      next(err)
    }
  },
  getPost: async (req, res, next) => {
    try {
      const userId = req.user?.id
      const postId = req.params.id
      const postInfo = await Post.findByPk(postId, {
        attributes: ['id', 'title', 'categoryId','content', 'userId'],
        include: [
          { 
            model: User,
            attributes: ['name', 'image']
          },
          {
            model: Category,
            attributes:['name']
          }
        ],
        raw: true,
        nest: true
      })
      const images = await Image.findAll({
        where: { postId },
        attributes: ['id', 'path'],
        raw: true
      })
      const comments = await Comment.findAll({
        where: { postId },
        attributes: ['id', 'content', 'userId'],
        include: [{
          model: User,
          attributes: ['id','name', 'image']
        }],
        order: [['createdAt', 'DESC']],
        raw: true,
        nest: true
      }) || []
      return res.render('post', { postInfo, images, userId, comments })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  postPost: async (req, res, next) => {
    try {
      const { title, categoryId, content } = req.body
      const images = req?.files.map(file => {
        return path.posix.join('upload', file.filename)
      })
      const userId = req.user.id

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
      req.flash('successMsg', '貼文上傳成功')
      return res.redirect('/')
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
      return res.render('postEdit', { postInfo, categories })
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
  }
}

module.exports = postController