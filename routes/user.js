const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const sendMail = require('../controller/sendMail')
const ActiveMail = require('../controller/postActive')
const bcrypt = require('bcrypt')
const {
  validSign,
  validLogin,
  forgotPasswordValidator,
  resetPasswordValidator
} = require('../helpers/valid')
const { errorHandler } = require('../helpers/dbErrorHandling');
const auth = require('../middleware/auth')


router.post('/Register',  validSign, async (req, res) => {
  try {
    const {name, email, password} = req.body
    console.log(req.body)
    if(!name || !email  || !password)
    return res.status(400).json({message:"Please fill in all fields."})
    //validating email in form
    if(!validateEmail(email))
    return res.status(400).json({message:"Invalid email."})
    //check if user exists
    const user = await User.findOne({email})
    if(user) return res.status(400).json({message:"This email already exists."})
    //password length validation
    if(password.length < 6)
    return res.status(400).json({message:"Password must be at least 6 characters."})
      //
      const newuser ={
        name,email,password
      }
      const activation_token = createActivationToken(newuser)
      const url = `${process.env.CLIENT_URL}user/activate/${activation_token}`
      sendMail(email,url,"Verify your email address!")
      res.json({
        message:`Register success! Please activate your Account.Email has been sent to ${email}`
      })
  } catch (error) {
    return res.json({
      success: 'false',
      errors: errorHandler(error)
    })
  }
})

router.post('/user/Activation',async (req,res)=>{
    try{
      const { token } = req.body
      const user = jwt.verify(token,process.env.ACTIVATION_TOKEN_SECRET)
      const { name , email ,  password } = user
      const check = await User.findOne({email})
      if(check) return res.status(400).json({ message:"This email already exists"})
      //NEW USER CONFIRMED
      const newuser =  new User({
        name,email,password
      })
      await newuser.save()
      ActiveMail(email)
      res.json({
        message:"Account Activated"
      })
    } catch (error){
      return res.json({
        success: 'false',
        errors: errorHandler(error)
      })
    }
})


/////////////////
//   login   ///
////////////////              
router.post('/login',validLogin,async(req,res)=>{
  try {
    const { email , password } = req.body;
    
    const user = await User.findOne({email})
    
    if(!user)  return res.status(400).json({ message:"This email does not exist"}) 
    
    if (user.comparePassword(password)) {
      
      const refresh_token = createRefreshToken({id:user._id})
      res.json({
       token:refresh_token,
       user:user
      })
    } else {
      res.status(400).json({
        message: 'Password is incorrect'
      })
    }
  } catch (error) {
    res.json({
      success: 'false',
      err: error
    })
  }
})
//
router.post('/user/forget',forgotPasswordValidator, async (req,res)=>{
   try {
     const { email }  = req.body

     const user =await User.findOne({email});
     if(!user) return res.status(400).json({message:"This email does not exist!"})
      
     const access_token = createAccessToken(user.toJSON())
     return user.updateOne({
      reset:access_token
    },(err,message)=>{
      if(err) {return res.status(400).json({error:err})
    }else{
      const url = `${process.env.CLIENT_URL}user/ResetPassword/${access_token}`
      sendMail(email,url,"Re-set your password")
      return res.json({
        message:`Please check your ${email}!`
      })

    }
    })
   } catch (error) {
     res.status(500).json({
       message:error.message
     })
   }
})
//RESET USER PASSWORD
router.post('/user/resetPassword',resetPasswordValidator,async(req,res)=>{
  try {
    const { reset , newpassword } = req.body
    const hash = await bcrypt.hash(newpassword,10)
    if(reset){
      jwt.verify(reset,process.env.ACCESS_TOKEN_SECRET,function(err,decoded){
        if(err) return res.status(400).json({error:'Expired Link! Try again'})
        User.findOneAndUpdate({ reset },{ "$set": { "password":hash, "reset": ""}}).exec(function(err, user){
          if(err) {
              console.log(err);
              res.status(500).send(err);
          } else {
                   res.status(200).send(user);
          }
       });
        
      })
    }
   
  
  } catch (error) {
    res.status(500).json({
      message:error
    })
  }

})
//GET USER INFORMATION
router.get('/user',auth,async(req,res)=>{
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.json({
           user:user
    })
  } catch (error) {
    res.status(500).json({
      message:error
    })
  }
})
//
router.get('/users',async(req,res)=>{
  try {
    const users = await User.find().select('-password')
    res.status(200).json({
      message:'success',
      users:users
    })    
  } catch (error) {
    res.json({
      message:error
    })
  }
})
//LOGOUT

router.post('/logout',(req,res)=>{
  try {
    res.clearCookie('refreshtoken',{path:'/user/refresh_token'})
    return res.json({message:"Logged out!"})
  } catch (error) {
    res.json({
      message:error
    })
  }
})
//Methods used
//Validate email
function validateEmail(email) {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}
//Creating Activation Token
const createActivationToken = (payload)=>{
  return jwt.sign(payload, process.env.ACTIVATION_TOKEN_SECRET,
          {
            expiresIn: '5m'
          }
)}
//Creating Access Token
const createAccessToken = (payload)=>{
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: '15m'
          })
}
//Creating Refresh Token
const createRefreshToken = (payload)=>{
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: '7d'
          })}

module.exports = router;
