const express = require('express')

const app = express()
const routes = require ('./routes')

const { engine } = require('express-handlebars')

const port = process.env.PORT || 3000

app.engine('.hbs', engine({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', '.hbs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true })) 
app.use(express.static('public'))

app.use(routes)

app.listen(port, () => {
  console.log(`1st express server on http://localhost:${port}`)
})

module.exports = app
