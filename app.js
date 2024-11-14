if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
  console.log('env = dev')
}
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')

const { engine } = require('express-handlebars')
const passport = require('./config/passport')

const handlebarsHelpers = require('./helpers/handlebarsHelpers')
const methodOverride = require('method-override')
const app = express()

const { Server } = require('socket.io')
const server = require('http').createServer(app) 
const io = new Server(server)

const routes = require ('./routes')
const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true })) 
app.use(express.static('public'))
app.use(methodOverride('_method'))
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
})
app.use(sessionMiddleware)
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('successMsg')
  res.locals.errMsg = req.flash('errMsg')
  next()
})

io.use((socket, next) => {
  sessionMiddleware(socket.request, socket.request.res || {}, next)
})
require('./controllers/websocketController')(io)

app.use(routes)

server.listen(port, () => {
  console.log(`express server on http://localhost:${port}`)
})

module.exports = app
