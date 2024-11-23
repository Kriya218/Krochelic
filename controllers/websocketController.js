const { Notice } = require('../models')

function setupWebSocket(io) {
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id)
    try {
      const signInUserId = socket.request.session.passport?.user
      
      if (!signInUserId) {
        throw new Error('User did not authenticate!')
      } else {
        socket.join(signInUserId)
        const unreadCounts = await Notice.count({
          where: { notifyId: signInUserId, isRead: false }
        })
        if (unreadCounts > 0) {
          socket.emit('updateNavBar', { notifyId: signInUserId })
        }
      }
    } catch (err) {
      console.log('Connection initialization error:', err)
      socket.disconnect()
    }
  })
}


module.exports = { setupWebSocket }
