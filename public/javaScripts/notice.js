const socket = io()

socket.on('connect', () => {
  console.log('Connected to server with Socket.IO:', socket.id)
})

document.addEventListener('DOMContentLoaded', () => {

  const subscribeBtn = document.querySelector('#subscribeBtn')
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function subscribeEmit(evt) {
      const subscribeId = evt.currentTarget.getAttribute('user-id')
      socket.emit('subscribe', subscribeId)
    })
  }

  socket.on('updateNavBar', data => {
    const userId = document.querySelector('#userId').value
    const redDot = document.querySelector('#red-dot')

    if (data.notifyId === parseInt(userId) && redDot) {
      redDot.classList.remove('d-none')
    }
  })
})

socket.on('redirect', data => {
  if (data.url && typeof data.url === 'string') {
    window.location.href = data.url
  }
})

