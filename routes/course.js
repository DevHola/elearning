const express = require('express')
const router = express.Router()
const multer = require('multer')
const Class = require('../models/class')
const Course = require('../models/courses')
const Creator = require('../models/creator')
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        if(file.fieldname === "coursethriller"){
      cb(null,'./uploads/Thriller')
    }else{
        cb(null,'./uploads/Poster')
    }
    },
    filename:function (req,file,cb){
      cb(null,file.fieldname + '-' + Date.now()+ '-' + file.originalname);
    }
});

const upload = multer({storage:storage,
    limit:{
    fileSize: 1024 * 1024 * 70
          },
    
});
 
var cpupload = upload.fields([{name:'courseposter'},{name:'coursethriller'}]);
//CREATE COURSES
router.post('/createCourse',cpupload,async(req,res,next)=>{
        try {
            const poster = await req.files.courseposter[0].path;
            const video = await req.files.coursethriller[0].path;
            const course = new Course({
                Title:req.body.title,
                Description:req.body.desc,
                ImageCaption:poster,
                VideoThriller:video,
                Creator:req.body.creator,
                Tags:req.body.tags,
               })
               console.log(course);
               await course.save(async function(err){
                   if(err){
                       res.json({
                           message:err
                       })
                   }
                   Creator.update({_id:course.Creator},{$push:{courses:course._id}}).exec()
               })
               res.status(200).json({
                   message:'successful',
                   course:course
               })
        } catch (error) {
           res.json({
               message:error,
               success:false
        })            
        }
})
//Get ALL COURSES
router.get('/courses',async(req,res)=>{
    try {
        const courses = await Course.find()
         res.status(200).json({
                message:'success',
                courses:courses
            })
        
    } catch (error) {
        res.json({
            message:error
        })
    }
})
//GET ONE COURSE
router.get('/courses/:id',async(req,res)=>{
    try {
        const course = await Course.findOne({_id:req.params.id})
        res.status(200).json({
            message:'successful',
            course:course
        })
    } catch (error) {
        res.json({
            message:error
        })
    }
})
//DELETE COURSES
router.delete('/course/delete/:id',async(req,res)=>{
    try {
        const course = await Course.findOneAndRemove({_id:req.params.id})
        if(course){
            res.status(200).json({
                message:'success'
            })
        }
    } catch (error) {
        res.json({
            message:error
        })
    }
})
//
router.get('course/class/:id',async(req,res)=>{
    try {
      const classes = await Class.find({course:req.params.id})
      if(classes<1){
        res.status(200).json({
          message:'No class Available for course'
        })
      }else{
        res.status(200).json({
          message:'success',
          classes:classes
        })
      }
    } catch (error) {
      res.json({
        message:error
      })
    }
    })
module.exports = router