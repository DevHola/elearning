const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
const CreatorSchema = Schema({
    Name:{
        type:String,
        required:true
    },
    Email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    profile:{
        type:String,
        required:false
    },
    courses:{
        type:Schema.Types.ObjectId,
        ref:'courses'
    },
    createdAt: {
        type: Date,
        default: Date.now
      }
})
//HASH PASSWORD
CreatorSchema.pre('save', function (next) {
    const creator = this
    if (this.isModified('password') || this.isNew) {
      bcrypt.hash(creator.password, 10, function (err, hash) {
        if (err) {
          return next(err)
        }
        creator.password = hash
        next()
      })
    } else {
      return next()
    }
  })
  // Remember this is the compare password function used in login function
  CreatorSchema.methods.comparePassword = function (password, next) {
    const creator = this
    return bcrypt.compareSync(password, creator.password)
  }
module.exports = mongoose.model('Creator',CreatorSchema)