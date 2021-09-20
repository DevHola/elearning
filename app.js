const express = require('express')
const app = express()
const server = require('http').Server(app)
const bodyParser = require('body-parser')

const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')
const dotenv = require('dotenv')
const path = require('path')

app.use(morgan('combined'))
app.use(cors())
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({extended:false,limit:'50mb',parameterLimit:1000000 }))
dotenv.config({ path: path.join(__dirname, '/.env') })
app.use('/upload', express.static('upload'))

//routes
const classrouter = require('./routes/class')
const courserouter = require('./routes/course')
const userrouter = require('./routes/user')
const creatorrouter = require('./routes/creator')
const enrollrouter = require('./routes/enrollment')

app.use('/Api', classrouter)
app.use('/Api', courserouter)
app.use('/Api', userrouter)
app.use('/Api',creatorrouter)
app.use('/Api',enrollrouter)

// mongodb connection
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  err => {
    if (err) {
      console.log(err)
    } else {
      console.log('connected to db')
    }
  })
//START SERVER & LISTEN
server.listen(process.env.PORT || 7000, function () {
    console.log('listening on port 7000')
  })
  