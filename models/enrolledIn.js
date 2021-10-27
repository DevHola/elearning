const mongoose = require('mongoose')
const Schema = mongoose.Schema
const EnrolledInSchema = Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    course:{
        type:Schema.Types.ObjectId,
        ref:'courses'
    },
    classes:
        {
            type:Schema.Types.ObjectId,
            ref: 'class'
        }
    ,
    Progress:{
        type:Number,
        default: 0
    },
    lastupdated:{
         type:Date,
         required:true
    },
    created:{
        type:Date,
        default:Date.now
    }

})
module.exports = mongoose.model('EnrolledIn',EnrolledInSchema)