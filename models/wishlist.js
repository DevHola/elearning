const mongoose = require('mongoose')
const Schema = require('Schema')
const WishlistSchema = Schema({
    Course:[{
        type:Schema.Types.ObjectId,
        ref:'courses'
   }],
   created:{
       type:Date.now,
       default:Date.now
   }
})
module.exports = mongoose.model('Wishlist',WishlistSchema)