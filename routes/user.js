const express = require('express')
const router = express.Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
router.post('/Register', async (req, res) => {
  try {
    const user = new User({
      Name: req.body.name,
      Email: req.body.email,
      NIN:req.body.NIN,
      password: req.body.password
    })
    await user.save(err => {
      if (err) {
        res.json({
          message: err
        })
      } else {
        // generate token
        const token = jwt.sign(user.toJSON(), process.env.JWT_SECRET,
          {
            expiresIn: 604800
          }

        )
        res.status(200).json({
          user: token,
          message: 'Registration Successful'
        })
      }
    })
  } catch (error) {
    return res.json({
      success: 'false',
      message: 'Registration Failed'
    })
  }
})
router.post('/login', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.json({
      success: false,
      message: 'Please enter email or password'
    })
  } else {
    try {
      const user = await User.findOne({ email: req.body.email })
      if (!user) {
        res.status(403).send({
          message: 'Authentication Fail.user not found',
          success: 'fail'
        })
      } else {
        if (user.comparePassword(req.body.password)) {
          const token = jwt.sign(
            user.toJSON()
            , process.env.JWT_SECRET,
            {
              expiresIn: 604800
            }

          )
          res.json({
            success: 'true',
            token: token
          })
        } else {
          res.status(403).send({
            success: 'fail',
            message: 'Authentication failed. password incorrect'
          })
        }
      }
    } catch (error) {
      res.json({
        success: 'false',
        message: error
      })
    }
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
module.exports = router;
