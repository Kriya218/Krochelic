
const { Post, Category, Image } = require('../models')


const postController = {
  home: (req, res, next) => {
    res.render('home')
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
      console.log('triggered')
      const { title, categoryId, content } = req.body
      const image = req.files
      
      const userId = req.user.id
      console.log('title:', title)
      console.log('image:', image)
      const newPost = await Post.create({
        title,
        categoryId,
        content,
        userId
      })
      if (image && image.length > 0) {
        const imageInfos = image.map(img => {
          return {
            postId: newPost.id,
            path: img.path
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