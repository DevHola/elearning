const express = require('express')
const router = express.Router()
const Creator = require('../models/creator')
const jwt = require('jsonwebtoken')
const Courses = require('../models/courses')
router.post('/RegisterCreator', async (req, res) => {
  try {
    const user = new Creator({
      Name: req.body.name,
      Email: req.body.email,
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
router.post('/logincreator', async (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.json({
      success: false,
      message: 'Please enter email or password'
    })
  } else {
    try {
      const user = await Creator.findOne({ Email: req.body.email })
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
router.get('/creators',async(req,res)=>{
    try {
        const creators = await Creator.find()
        if(creators < 1){
        res.status(200).json({
            message:'No Creator Available'
        })
        }else{
        res.status(200).json({
            message:'success',
            creators:creators
        })   }
    } catch (error) {
        res.json({
            message:error
        })
    }
})
router.get('creator/courses/:id',async(req,res)=>{
try {
  const courses = await Courses.find({Creator:req.params.id})
  if(courses<1){
    res.status(200).json({
      message:'No Course Available'
    })
  }else{
    res.status(200).json({
      message:'success',
      courses:courses
    })
  }
} catch (error) {
  res.json({
    message:error
  })
}
})
module.exports = router;
