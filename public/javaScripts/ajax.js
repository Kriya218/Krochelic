// export async function toggleLike(btn) {
//   const postId = btn.dataset.postId

//   try {
//     const res = await fetch(`/like/${postId}`, {
//       method: 'POST',
//       headers: { 'ContentType': 'application/json' }
//     })
//     const result = await res.json()
//     if (result.success) {
//       const icon = btn.querySelector('i')
//       if (result.isLike) {
//         icon.classList.remove('fa-regular')
//         icon.classList.add('fa-solid')
//       } else {
//         icon.classList.remove('fa-solid')
//         icon.classList.add('fa-regular')
//       }
//     }
//   } catch (err) {
//     console.error('Failed to toggle like:', err)
//   }
// }