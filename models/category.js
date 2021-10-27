const mongoose = require('mongoose')
const Schema = mongoose.Schema
const CategorySchema = Schema({
    Title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    created:{
        type:Date,
        default:Date.now
    }

})
module.exports = mongoose.model('category',CategorySchema)