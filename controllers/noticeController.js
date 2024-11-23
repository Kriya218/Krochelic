const { Notice, User, Post, Like, Comment } = require('../models')

const noticeController = {
  getNotice: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const userId = parseInt(req.params.userId)
      if (!signInUser) throw new Error('請先登入')
      if (userId !== signInUser) throw new Error('無檢視通知權限')
      const notices = await Notice.findAll({
        where: { notifyId: userId, isRead: false },
        order: [['createdAt', 'DESC']],
        raw: true
      })
      await Notice.update({ isRead: true },{
        where: { notifyId: userId, isRead: false } 
      })
      
      const noticeUserIds = [...new Set(notices.map(notice => notice.userId))]
      const users = await User.findAll({
        where: { id: noticeUserIds },
        attributes: ['id', 'name', 'image'],
        raw: true
      })
      const usersInfoMap = users.reduce((map, user) => {
        map[user.id] = user
        return map
      }, {})
      
      const formattedNotices = notices.map(notice => ({
        ...notice,
        userInfo: usersInfoMap[notice.userId]
      }))

      return res.render('notice', { notices: formattedNotices, profileUser: signInUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = noticeController
