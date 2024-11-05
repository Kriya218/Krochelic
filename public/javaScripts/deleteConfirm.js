document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', function addDeleteDataId (evt) {
      const deleteIcon = document.querySelector('#confirm-delete-button')
      deleteIcon.setAttribute('form', `delete-form`)
    })
})