const socket = io()

socket.on('connect', () => {
  console.log('Connected to server with Socket.IO:', socket.id)
})

document.addEventListener('DOMContentLoaded', () => {
  // const form = document.getElementById('postForm')
  // form.addEventListener('submit', evt => {
  //   evt.preventDefault()
  //   const formData = new FormData(form)
  //   const data = {
  //     title: formData.get('title'),
  //     categoryId: formData.get('categoryId'),
  //     content: formData.get('content')
  //   }
  //   const files = formData.getAll('images')
  //   const images = []
  //   files.forEach(file => {
  //     const reader = new FileReader
  //     reader.onload = () => {
  //       images.push({
  //         name: file.name,
  //         type: file.type,
  //         data: reader.result
  //       })
  //       if (images.length === file.length) {
  //         socket.emit('newPost', { data, images })
  //       }
  //     }
  //     reader.readAsDataURL(file)
  //   })
  // })
  const subscribeBtn = document.querySelector('#subscribeBtn')
  if (subscribeBtn) {
    subscribeBtn.addEventListener('click', function subscribeEmit(evt) {
      const subscribeId = evt.currentTarget.getAttribute('user-id')
      socket.emit('subscribe', subscribeId)
    })
  }

  socket.on('updateNavBar', data => {
    const userId = document.querySelector('#userId').value
    if (data.subscribeId === userId) {
      const redDot = document.querySelector('#red-dot')
      if (redDot) {
        redDot.classList.remove('d-none')
      }
    }
  })
})

socket.on('redirect', data => {
  if (data.url && typeof data.url === 'string') {
    window.location.href = data.url
  }
})
