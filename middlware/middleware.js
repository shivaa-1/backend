import jwt from 'jsonwebtoken';

//create a json web token
export const createToken =(email,id)=>{
    const token = jwt.sign({email,id},process.env.JWT_KEY,{expiresIn:"120m"})
    return token;
}

// function decode the jwt token and retreive the payload

export const jwtDecode=(token)=>{
    //jwt.decode method to decode the token
    let data = jwt.decode(token);
    return data;
}