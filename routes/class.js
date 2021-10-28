const express = require('express')
const router = express.Router()
const Class = require('../models/class')
const Course = require('../models/courses')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        if(file.fieldname === "coursevideo"){
      cb(null,'./uploads/videos')
    }else{
        cb(null,'./uploads/notes')
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
 
var cpupload = upload.fields([{name:'coursevideo'},{name:'coursenote'}]);
//REST API FOR CLASS MODEL
router.post('/create/class',cpupload,async(req,res,next)=>{
    try {
        const video =await req.files.coursevideo[0].path;
        const note = await req.files.coursenote[0].path;
        const classContent = new Class({
            Title:req.body.title,
            Description:req.body.desc,
            classVideo :video,
            classNote  :note,
            course     :req.body.course
        })
           await classContent.save(async function(err){
               if(err){
                   res.json({
                       message:err
                   })
               }
            Course.update({_id:classContent.course},{$push:{classes:classContent._id}}).exec();
           })
           res.status(200).json({
               message:'success',
               class:classContent
           })
              
    } catch (error) {
        res.json({
            message:error
        })
    }
})
//
router.get('/classes',async(req,res)=>{
       try {
        const finder = await Class.find()
        res.status(200).json({
            message:'success',
            classes:finder
        })
       } catch (error) {
          res.json({
              message:error
          }) 
       }
})
//
router.get('/classes/:id',async(req,res)=>{
    try {
        const finder = await Class.findOne({_id:req.params.id})
        res.status(200).json({
            message:'success',
            class:finder
        })
    } catch (error) {
        res.json({
            message:error
        })
    }

})
router.get('/progress-score/:id',async(req,res)=>{
    try {
        const query = await Class.find({course:req.params.id});
        query.count(function(err,count){
            if(err) return res.status(403).json({message:err.message})
            else {
                const midvalue = count/100;
                const percent = midvalue * 100;
                console.log(percent)
                res.status(200).json({
                    percent:percent
                })
            }            
        })
    } catch (error) {
        
    }
})
module.exports = router;