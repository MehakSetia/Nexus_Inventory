const {registerSchema,loginSchema}=require('../validators/auth.validator');
const bcrypt=require('bcryptjs');
const User=require('../models/user');
const jwt=require('jsonwebtoken');

const register=async(req,res,next)=>{
    try{
        const {name,email,password,phone,role}=req.body;
        registerSchema.parse({name,email,password,phone,role});
        
        const hasMail=await User.findOne({email});
        if(hasMail!==null){
            const error=new Error("email already exists");
            error.statusCode=400;
            return next(error);
        }
        const hashedPass=await bcrypt.hash(password,10);
        const newUser=await User.create({name,email,password:hashedPass,phone,role
        });
        res.status(201).json("User created");
    }
    catch(err){
        next(err);
    }
};

const login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;

        loginSchema.parse({email,password});

        const hasMail=await User.findOne({email});
    
        if(hasMail===null){
            const error=new Error("Invalid email or password");
            error.statusCode=400;
            return next(error);
        }
        const pass=await bcrypt.compare(password,hasMail.password);

        if(!pass){
            const error=new Error("Invalid email or password");
            error.statusCode=400;
            return next(error);
        }
        const token=jwt.sign(
            {userId:hasMail._id,role:hasMail.role},
            process.env.JWT_SECRET,
            {expiresIn:"1h"}
        )
        return res.json({message:"Login successful",token});
    }
    catch(err){
        return next(err);
    }
};

module.exports={ register,login };