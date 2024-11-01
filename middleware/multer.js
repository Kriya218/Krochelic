const multer = require('multer')
const path = require('path')
const fileFilter = (req, file, next) => {
  try {
    const ext = path.extname(file.originalname)
    if (!/\.jpg|\.jpeg|\.png$/i.test(ext)) {
      return next(new Error('僅限上傳.jpg、.jpeg、.png 格式檔案'))
    }
    next(null, true)
  } catch (err) {
    console.log('Error:', err)
    next(err)
  }
}
const upload = multer({ 
  dest: 'upload/',
  fileFilter
})

module.exports = upload