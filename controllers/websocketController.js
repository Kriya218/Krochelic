const { User, Subscribeship, Notice } = require('../models')

module.exports = (io) => {
  io.on('connection', async (socket) => {
    console.log('A user connected:', socket.id)
    try {
      const userId = socket.request.session.passport?.user
      if (!userId) throw new Error('User did not authenticate!')

      const user = await User.findOne({ 
        where: { id: userId },
        attributes: ['id', 'image', 'name'],
        raw: true
      })
      if (!user) throw new Error('User did not exist!')
      
      const signInUserId = parseInt(user.id)

      // create subscribeship 我(登入者)去訂閱其他人時觸發
      socket.on('subscribe', async(subscribeId) => {
        try {
          const subscribeShip = await Subscribeship.findOne({
            where: { subscribeId, subscriberId: signInUserId }
          })
          if (subscribeShip) throw new Error('已訂閱此作者')
          await Subscribeship.create({
            subscribeId,
            subscriberId: signInUserId
          })
          socket.join(subscribeId)

          const description = '訂閱了你的帳號'
          await Notice.create({
            userId: signInUserId,
            description,
            isRead: false,
            notifyId: subscribeId
          })
          
          // if subscribe user online submit navbar update event
          const isSubscribeOnline = io.sockets.adapter.rooms.has(subscribeId)
          console.log('isSubscribeOnline:', isSubscribeOnline)
          if (isSubscribeOnline) {
            io.emit('updateNavBar', { subscribeId })
          }
          // redirect to update subscribe button in profile
          socket.emit('redirect', { url: `/profile/${subscribeId}` })
          
        } catch (err) {
          console.log('Error in subscribe event:', err)
        }
      })

      // read notice
      // socket.on('readNotice', async ({ userId }) => {
      //   await Notice.update({ unread: false }, {
      //     where: { userId }
      //   })
      // })
      
      // add user to subscribes room
      const subscriptions = await Subscribeship.findAll({
        where: { subscriberId: signInUserId }
      })
      subscriptions.forEach(subscribe => {
        socket.join(subscribe.subscribeId)
      })

      

      // subscribe user's post notice
      // socket.on('newPost', data => {
      //   console.log('Received post data:', data)
      //   console.log('Received images:', images)
      // })
      
    } catch (err) {
      console.log('Connection initialization error:', err)
      socket.disconnect()
    }
  })
}
