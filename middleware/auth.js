const jwt = require('jsonwebtoken')

const auth = (req,res,next) =>{
      try {
          const token = req.header('x-auth-token')
          if(!token)  return res.status(401).json({msg:"No token , authentication denied!"})
          jwt.verify(token,process.env.REFRESH_TOKEN_SECRET,(err,user)=>{
              if(err) return res.status(401).json({msg:"No token, authentication denied"})
              req.user = user
              next()
          })
      } catch (error) {
          return res.status(500).json({
              msg:error.message
          })
      }
}
module.exports = auth