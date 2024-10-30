const multer = require('multer')
const upload = multer({ dest: 'upload/' })
const uploadMultiple = upload.array('images', 4)

module.exports = { uploadMultiple }