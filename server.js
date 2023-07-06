//importing the files
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
// import { createToken } from './middlware/middleware.js';
import jwt from 'jsonwebtoken';
import { createToken, jwtDecode } from './middlware/middleware.js';
import {sendpasswordMail} from './Utils/utils.js';

//load the environment variable
dotenv.config()
const PORT = process.env.PORT;
const MONGO_URL = process.env.MONGO_URL;
const JWT_KEY = process.env.JWT_KEY;
//create an instance for the express
const app = express();
app.use(express.json());
app.use(cors());

//connect to mongodb database
mongoose.connect(MONGO_URL)
.then(()=>{
    console.log("MongoDB Connected Suceesfully.")
}).catch(()=>{
    console.log("MongoDB Not Connected Successfully.")
});

//create a mongoose schema
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    forgotToken:{
        type:String,
        default:''
    }

});

//create a mongoose model
const User = new mongoose.model('User',userSchema);

//create a route for homepage
app.get('/',(req,res)=>{
    res.send("Welcome To Login Details and Registration Page.")
});

//create a route for the register page to post the data
app.post('/register',async(req,res)=>{
    const {name,email,password} = req.body;
    const oldUser=await User.findOne({email:email});
    

    if (oldUser) {
        return res.send(({message:"User Already Created."}))
    }
        const hashedPass = await bcrypt.hash(password,10); 

    try {
        const newUser = await User.create({
            name:name,
            email:email,
            password:hashedPass
        })
        
        const savedUser= await newUser.save()
        
        res.send({message:"User Created Successfully"});
    } catch (error) {
        res.send(error);
    }

});

// create a route to login
app.post('/login',async(req,res)=>{
    const {email,password} = req.body;

    const previousUser = await User.findOne({email:email});
    if(!previousUser){
       return res.send({message:"User Not Found"})
    }

    const hashpassword = await bcrypt.compare(password,previousUser.password);


    //check the passsword if user is there
        if (hashpassword){
            //call token from middleware
            // const token =jwt.sign({userId:previousUser._id},JWT_KEY,{expireIn:'1h'})
            const token = await createToken(previousUser.email);
                res.send({message:"Login Successfully." ,token:token})
            }else{
                res.send({message:"Password is Incorrect."})
                }    
        }

);

//route to forgot password
app.post('/forgotpassword',async(req,res)=>{

    try {
        const user = await User.findOne({email:req.body.email});
        
        //check user is exist is or not in db
        if (user!==null) {
            const forgotToken = jwt.sign({email:req.body.email},JWT_KEY);
            const data = await User.updateOne({email:req.body.email},{$set:{forgotToken:forgotToken}},{expiresIn:"5m"});

            sendpasswordMail(user.name,user.email,forgotToken);

            res.send({
                data,
                status:200,
                message:"Please check your email for the reset password link"
            })
        }else{
            res.send({
                message:"Email not found"
            })
        }

        
    } catch (error) {
        res.status(401).send(error,error.message);        
    }
    


})

//route to reset password
app.post('/resetpassword/:token'),async(req,res)=>{

    try {
        //find the user based on token in db
        const userToken= await User.findOne({forgotToken:req.body.token});

        if (userToken!==null) {
            //decode the token
            const decode= await jwtDecode(userToken.forgotToken);

            //get the current time
            let currentTime = Math.round(new Date()/1000);
            
            // res.send({
            //     status:200,
            //     success:true,
            //     message:"Token verified successfully"
            // })

            // //chech the curent time with expire token time
            if (currentTime<=decode.expiresIn) {
                console.log("hello")

                res.send({
                    status:200,
                    success:true,
                    message:"Token verified successfully"
                })
            }else{
                res.send({
                    status:201,
                    success:true,
                    message:"Link has expired"
                })
            }

                        
        }else{
            res.send({
                status:204,
                success:true,
                message:"This link is already used"
            })
        }
        
    } catch (error) {
        res.send({
            statusbar:401,
            success:false,
            message:"Error.",
            error:error
        })
    } 

}

//route to save new password
app.post('/newpassword',(req,res)=>{

})

//listen to the port and server
app.listen(PORT,()=>{
    console.log(`Server Started At ${PORT}`)
});