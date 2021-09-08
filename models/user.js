const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
//USER MODEL FOR AUTHENICATION AND PERSONALIZATION AND COMPUTATION WITH RESPECT TO OBJECT
const UserSchema = Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        trim:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
    },
    NIN:{
        type:String,
        required:[true,"Please enter your NIN"],
        unique:true,
        maxLength:11
    },
    avatar:{
      type:String,
      required:false
    },
    location:{
      type:String,
      required:false
    },
    activity:{
      type:String,
      required:false
    },
    createdAt: {
        type: Date,
        default: Date.now
      }
})
//HASH PASSWORD
UserSchema.pre('save', function (next) {
    const user = this
    if (this.isModified('password') || this.isNew) {
      bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
          return next(err)
        }
        user.password = hash
        next()
      })
    } else {
      return next()
    }
  })
  // Remember this is the compare password function used in login function
  UserSchema.methods.comparePassword = function (password, next) {
    const user = this
    return bcrypt.compareSync(password, user.password)
  }
module.exports = mongoose.model('user',UserSchema)