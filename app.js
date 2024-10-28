if (process.env.NODE_ENV === 'development') {
  require('dotenv').config()
  console.log('env = dev')
}
const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')

const { engine } = require('express-handlebars')
const passport = require('./config/passport')

const handlebarsHelpers = require('./helpers/handlebarsHelpers')

const app = express()
const routes = require ('./routes')
const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true })) 
app.use(express.static('public'))
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())
app.use((req, res, next) => {
  res.locals.successMsg = req.flash('successMsg')
  res.locals.errMsg = req.flash('errMsg')
  next()
})

app.use(routes)

app.listen(port, () => {
  console.log(`express server on http://localhost:${port}`)
})

module.exports = app
