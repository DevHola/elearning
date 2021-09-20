const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcrypt')
//USER MODEL FOR AUTHENICATION AND PERSONALIZATION AND COMPUTATION WITH RESPECT TO OBJECT
const UserSchema = Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        lowercase:true,
        trim:true
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        trim:true,
        lowercase:true,
        unique:true
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
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
    reset:{
      type:String,
      default:""
    }
},{timeStamp:true})
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