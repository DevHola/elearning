const express = require('express')
const router = express.Router()
const Enrollment = require('../models/enrolledIn')
const Course = require('../models/courses')
//ENROLLMENT
router.post('/ENROLL',async (req,res)=>{
  try {
    const enrollment = new Enrollment({
        user:req.body.user,
        course:req.body.course,
        Completion:req.body.Completion || 0,
        lastupdated:new Date()
    })
    await enrollment.save(async function(error){
        if(error){
            res.json({
                message:error
            })
        }
        Course.update({_id:enrollment.course},{$push:{Participants:enrollment._id}}).exec()
    })
    res.status(200).json({
        message:'success Enrollment'
    })
  } catch (error) {
      res.json({
          message:error
      })
  }
    
})
//GET STUDENT BASED ON COURSE 
router.get('/enrolled/:id',async(req,res)=>{
    try {
        const Enrollers = await Enrollment.find({course:req.params.id})
    if(Enrollers){
        res.status(200).json(
            {
                message:'successful',
                users:Enrollers
            }
        )
    }
    } catch (error) {
     res.json({
         message:error
     })   
    }
})
router.get('/enrollment',async (req,res)=>{
    try {
        const enroll = await Enrollment.find()
    res.status(200).json({
        message:'success',
        enroll:enroll
    })
    } catch (error) {
      res.json({
          message:error
      })  
    }
})
//WHERE COMPLETED = 100%
router.get('/enrolled/completed',async(req,res)=>{
try {
    const completed = await Enrollment.find({Completion:100})
    res.status(200).json({
        message:'success',
        completed:completed
    })
} catch (error) {
    res.json({
        message:error
    })
}
})

//UNENROLL
router.delete('/enroll/delete/:id',async(req,res)=>{
    try {
        const enroll = await Enrollment.findOneAndRemove({_id:req.params.id})
        if(enroll){
            Course.update({_id:enroll.course},{$pull:{Participants:enroll._id}}).exec()
        }
        res.status(200).json({
            message:'Deletion success'
        })
    } catch (error) {
        res.json({
            message:error
        })
    }
})
module.exports = router