const { Comment, Post, Notice } = require('../models')
const commentController = {
  postComment: async (req, res, next) => {
    try {
      const { content, postId } = req.body
      const postInfo = await Post.findByPk(postId, {
        attributes: ['userId'],
        raw: true
      })
      if (content === "") throw new Error('評論內容不可為空白')
      const comment = await Comment.create({
        content,
        userId: req.user.id,
        postId
      })
      
      req.flash('successMsg', '評論成功')

      if (req.user.id !== postInfo.userId) {
        Notice.create({
          userId: req.user.id,
          description: `評論了你的貼文: ${comment.content}`,
          postId,
          commentId: comment.id,
          isRead: false,
          notifyId: postInfo.userId
        })
          .catch(err => console.err('Notice creation failed:', err))
      }
      return res.redirect(`/posts/${postId}`)
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  },
  deleteComment: async (req, res, next) => {
    try {
      const commentId = req.params.id
      const comment = await Comment.findByPk(commentId)
      if (!comment) {
        req.flash ('errMsg', '評論不存在')
        return res.redirect('back')
      }
      await comment.destroy()
      req.flash('successMsg', '評論已刪除')
      return res.redirect('back')
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = commentController