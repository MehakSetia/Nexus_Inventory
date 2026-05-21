const jwt=require('jsonwebtoken');

const verify=async(req,res,next)=>{
    try{
    const token=req.headers.authorization.split(" ")[1];
    const decoded=jwt.verify(token,process.env.JWT_SECRET);
    req.user=decoded;
    next();
}
catch(err){
    const error=new Error("Unauthorised");
    error.statusCode=401;
    return next(error);
}
}

const isAdmin=(req,res,next)=>{
    if(req.user.role==="Admin") next();
    else{
        const error=new Error("Unauthorised");
        error.statusCode=403;
        return next(error);
    }
}

module.exports={verify,isAdmin};

