const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CourseSchema = Schema({
 Title:{
     type:String,
     required:true,
     unique:true
 },
 Description:{
     type:String,
     required:true
 },
 ImageCaption:{
     type:String,
     required:true
 },
 VideoThriller:{
     type:String,
     required:true
 },
 Creator:{
    type: Schema.Types.ObjectId,
    ref: 'Creator'
 },
/* Tags:[{
    type: Schema.Types.ObjectId,
    ref: 'Tag'

 }],*/
 classes:
     {
         type:Schema.Types.ObjectId,
         ref: 'class'
     },
 Participants:{
        type:Schema.Types.ObjectId,
        ref:'EnrolledIn'
 },
 Favourite:{
     type:Schema.Types.ObjectId,
     ref:'user'
 },

 created:{
     type:Date,
     default:Date.now
 }
})
module.exports = mongoose.model('courses',CourseSchema)