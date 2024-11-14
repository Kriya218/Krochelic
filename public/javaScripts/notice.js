const socket = io()

socket.on('connect', () => {
  console.log('Connected to server with Socket.IO:', socket.id)
  // socket.on('server-msg', msg => {
  //   console.log('receive msg from server:', msg)
  // })
})

