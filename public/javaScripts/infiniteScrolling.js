// export function infiniteScrolling(limit, cursor, posts) {
//   let loading = false
//   document.querySelector('#loading-indicator').computedStyleMap.display = 'block'
//   try {
//     const container = document.querySelector('.post-container')
//     posts.forEach(post => {
//       const div = document.createElement('div')
//       const postHTML = `
//         <div class="card" style="width: 15rem; height: 18rem; padding: 0;">
//           <a href="posts/${post.id}">
//             <img src="${post.image}" class="card-img-top" style="height: 180px; object-fit:cover;" alt="post image">
//           </a>

//           <div class="card-body">
//             <h6 class="card-title"><a href="posts/${post.id}">${post.title}</a></h6>
//             <div class="d-flex mt-4">
//               <span class="btn button-b my-auto p-1" style="pointer-events: none; font-size: smaller;">{{this.Category.name}}</span>
//               {{#if ../signInUser}}
//                 {{> likeButton}}
//               {{else}}
//                 <form action="/like/${post.id}" method="post" class="ms-auto">
//                   <button type="submit" class="text-button">
//                     <i class="fa-regular fa-heart fa-xl me-2 mt-3" style="color: #ED6D46;"></i>
//                   </button>
//                 </form>
//               {{/if}}
//             </div>
//           </div>
//         </div>`
//     })
//   }
// } 

