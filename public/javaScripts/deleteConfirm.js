document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.delete-button').forEach(btn => {
    btn.addEventListener('click', function addDeleteDataId (evt) {
      const id = evt.currentTarget.getAttribute('comment-id')
      const deleteIcon = document.querySelector('#confirm-delete-button')
      deleteIcon.setAttribute('form', `delete-form-${id}`)
    })
  })
})