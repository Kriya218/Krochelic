const { User } = require('../models')

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id)
    const userId = socket.request.session.passport?.user
    if (!userId) {
      console.log("User not authenticated. Connection terminated.")
      socket.disconnect() // 結束連線
      return
    }
    User.findOne({
      where: { id: userId }
    })
      .then(user => {
        if (user) {
          const signInUserId = parseInt(user.id)
          console.log('signInUserId:', signInUserId)
        }
      })
  })
}