// import { response } from 'express';
import nodemailer from 'nodemailer';

export const sendpasswordMail =async(name,email,token)=>{
    try {
        var transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:'shivasharm2110@gmail.com',
                password:'fbahdvvoyogjhhbm',
            },
            tls:{
                rejectUnautorized:false
            }
        });
        var mailOptions={
            from:'shivasharm2110@gmail.com',
            to:email,
            subject:'Reset Password',
            html:`<p>Hii ${name}.Please copy this link <a href="http://localhost:8000/resetpassword/${token}" target=_blank>Click Here</a> and reset password  </p>`
        }

        transporter.sendMail(mailOptions,function(error,response){
            if (error) {
                console.log(error)
                return;
            }
            console.log("Message Sent");
            transporter.close();
        })
    } catch (error) {
        res.send({success:false,msg:error.message})
    }
}