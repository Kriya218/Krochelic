const { Notice, User } = require('../models')

const noticeController = {
  getNotice: async (req, res, next) => {
    try {
      const signInUser = req.user?.id
      const notifyUserId = parseInt(req.params.notifyUserId)
      if (!signInUser) throw new Error('請先登入')
      if (notifyUserId !== signInUser) throw new Error('無檢視通知權限')
      const notices = await Notice.findAll({
        where: { notifyId: signInUser, isRead: false },
        include: [{ 
          model: User,
          attributes: ['name', 'image']
        }],
        order: [['createdAt', 'DESC']],
        nest: true
      })
      Notice.update({ isRead: true }, {
        where: { notifyId: signInUser, isRead: false } 
      })
      
      const formattedNotices = notices.map(notice => ({
        ...notice.toJSON()
      }))

      return res.render('notice', { notices: formattedNotices, signInUser })
    } catch (err) {
      console.log('Error:', err)
      next(err)
    }
  }
}

module.exports = noticeController
