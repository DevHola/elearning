const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const sendMail = require('../controller/sendMail')
const ActiveMail = require('../controller/postActive')

router.post('/Register', async (req, res) => {
  try {
    const {name, email, NIN, password} = req.body
    if(!name || !email || !NIN || !password)
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
        name,email,NIN,password
      }
      const activation_token = createActivationToken(newuser)
      const url = `${process.env.CLIENT_URL}/user/activate/${activation_token}`
      sendMail(email,url,"Verify your email address!")
      res.json({
        message:'Register success! Please activate your email to start'
      })
  } catch (error) {
    return res.json({
      success: 'false',
      message: error.message
    })
  }
})

router.post('/user/Activation',async (req,res)=>{
    try{
      const { activation_token } = req.body
      const user = jwt.verify(activation_token,process.env.ACTIVATION_TOKEN_SECRET)
      const { name , email , NIN , password } = user
      const check = await User.findOne({email})
      if(check) return res.status(400).json({ message:"This email already exists"})
      //NEW USER CONFIRMED
      const newuser =  new User({
        name,email,NIN,password
      })
      await newuser.save()
      ActiveMail(email)
      res.json({
        message:"Account Activated"
      })
    } catch (error){
      return res.json({
        success: 'false',
        message: error.message
      })
    }
})


/////////////////
//   login   ///
////////////////              
router.post('/login',async(req,res)=>{
  try {
    const { email , password } = req.body;
    
    const user = await User.findOne({email})
    
    if(!user)  return res.status(400).json({ message:"This email does not exist"}) 
    
    if (user.comparePassword(password)) {
      
      const refresh_token = createRefreshToken({id:user._id})
      res.cookie('refreshtoken',refresh_token, {
        httpOnly:true,
        path:'/user/refresh_token',
        maxAge: 7*24*60*60*1000
      })
      res.json({
       message:'Login success!',
       token:refresh_token
      })
    } else {
      res.status(400).json({
        message: 'Password is incorrect'
      })
    }
  } catch (error) {
    res.json({
      success: 'false',
      message: error
    })
  }
})
//
router.post('/user/refresh_token', (req,res)=>{
  try {
    const rf_token = req.cookies.refreshtoken;
    if(!re_token) return res.status(400).json({message:"Please login now!"})
       jwt.verify(rf_token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
        if(err) return res.status(400).json({message:"Please login now!"})
        const access_token = createAccessToken({id:user._id})
        res.json({access_token})
       })
  } catch (error) {
    res.status(500).json({
      message:error
    })
  }
})
//
router.post('/user/forget',async (req,res)=>{
   try {
     const { email }  = req.body

     const user =await User.findOne({email});
     if(!user) return res.status(400).json({message:"This email does not exist!"})
      
     const access_token = createAccessToken(user.toJSON())
      const url = `${process.env.CLIENT_URL}/user/reset/${access_token}`
      sendMail(email,url,"Re-set your password")
      res.json({
        message:'Please check your email!'
      })
   } catch (error) {
     res.status(500).json({
       message:error.message
     })
   }
})
//
router.post('/user/resetPassword',async (req,res)=>{
  try {
    const { password } = req.body
    await User.findByIdAndUpdate({_id:password})
  } catch (error) {
    res.status(500).json({
      message:error
    })
  }

})
//
router.get('/users',async(req,res)=>{
  try {
    const users = await User.find()
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