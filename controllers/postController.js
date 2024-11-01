const path = require('path')
const { Post, Category, Image } = require('../models')


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
      return res.render('post', { categories } )
    } catch (err) {
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
  }
}

module.exports = postController