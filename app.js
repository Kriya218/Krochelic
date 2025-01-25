if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  require('dotenv').config()
  console.log('env = ', process.env.NODE_ENV)
}
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const path = require('path')
const { RedisStore } = require('connect-redis')
const redisClient = require('./config/redis')

const { engine } = require('express-handlebars')
const passport = require('./config/passport')

const handlebarsHelpers = require('./helpers/handlebarsHelpers')
const methodOverride = require('method-override')
const app = express()

const { Server } = require('socket.io')
const server = require('http').createServer(app) 
const io = new Server(server)
const { setupWebSocket } = require('./controllers/websocketController')

const routes = require ('./routes')

const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true })) 
app.use(express.static('public'))
app.use(express.json())
app.use(methodOverride('_method'))
const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'krochelic:'
})
const sessionMiddleware = session({
  store: redisStore,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: 'lax'
  } 
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

setupWebSocket(io)
app.get('/health', (req, res) => {
    res.status(200).send('OK')
})

app.use(routes)

server.listen(port, '0.0.0.0', () => {
  console.log(`express server is listening on port ${port}`)
})

module.exports = app
