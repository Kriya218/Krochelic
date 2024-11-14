const { User, Comment } = require('../models')
const commentController = {
  postComment: async (req, res, next) => {
    try {
      const { content, postId } = req.body
      console.log('content:', content)
      if (content === "") throw new Error('評論內容不可為空白')
      await Comment.create({
        content,
        userId: req.user.id,
        postId
      })
      req.flash('successMsg', '評論成功')
      return res.redirect(`/posts/${postId}`)
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const { postId } = req.body
      const comment = await Comment.findByPk(postId)
      await comment.destroy()
      req.flash('successMsg', '評論已刪除')
      return res.redirect(`/posts/${postId}`)
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = commentController