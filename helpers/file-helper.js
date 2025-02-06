const path = require('path')
const AWS = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
})

const s3FileHandler = multerS3({
  s3: s3,
  bucket: process.env.AWS_S3_BUCKET_NAME,
  acl: 'public-read',
  metadata: function(req, file, cb) {
    cb(null, { fieldName: file.fieldname })
  },
  key: function(req, file, cb) {
    cb(null, 'krochelic/uploads/'+ Date.now().toString() + '-' + file.originalname)
  }
})

const localFileHandler = files => {
  if (Array.isArray(files)) {
    return files.map(file => path.posix.join('upload', file.filename))
  } else if (typeof files === 'string' || typeof files === 'object') {
    return path.posix.join('upload', files.filename)
  } else {
    return null
  }
}

const fileFilter = (req, file, next) => {
  try {
    const ext = path.extname(file.originalname)
    if (!/\.jpg|\.jpeg|\.png$/i.test(ext)) {
      // return next(new Error('僅限上傳.jpg、.jpeg、.png 格式檔案'))
      return next(null, false)
    }
    next(null, true)
  } catch (err) {
    console.log('Error:', err)
    next(err)
  }
}

// const upload = multer({ dest: 'upload/', fileFilter })
const upload = process.env.NODE_ENV === 'production' ? multer({ storage: s3FileHandler }) : multer({ dest: 'upload/', fileFilter })

const fileHandler = files => {
  if (!files || files.length === 0) return Promise.resolve(null)
  if (process.env.NODE_ENV === 'production') {
    // 確保 files 為陣列，統一處理
    const fileArray = Array.isArray(files) ? files : [files]
    // 回傳對應的 S3 路徑
    return Promise.resolve(fileArray.length === 1 ? fileArray[0].location : fileArray.map(file => file.location))
  } else if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return Promise.resolve(localFileHandler(files))
  } else {
    return null
  }
}

module.exports = { fileHandler, upload }

// if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  //   try {
  //     return Promise.resolve(localFileHandler(files))
  //   } catch (err) {
  //     console.error('File handler error:', err)
  //     return Promise.reject(err)
  //   }
  // } else {
  //   return Promise.resolve(null)
  // }