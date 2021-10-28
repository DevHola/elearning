const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ClassSchema = Schema({
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    classVideo:{
        type:String,
        required:true
    },
    classNote:{
         type:String,
         required:true
    },
    parent:{
        type: Schema.Types.ObjectId,
        ref: 'courses'

    },
    created:{
        type:Date,
        default:Date.now
    }

})
module.exports = mongoose.model('class',ClassSchema)