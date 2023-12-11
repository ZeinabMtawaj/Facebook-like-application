const jwt = require('jsonwebtoken');
const config = require('../../config/db');
const express = require('express');
var router = express.Router();

const verfiyToken = async (req, res, next) => {
    if(req.headers.authorization && req.headers. authorization.split(' ')[0] === 'Bearer'){
        token = req.headers.authorization.split(' ')[1];
        if(!token)
           return res.json({sucess: false, msg: "No Token Provided"});
     }
    else{
       return res.json({sucess: false, msg: "No Token Provided"});
    }
    const key = config.connAttr.secretKey;
    try{
        let decoded = await jwt.verify(token, key);
        res.locals.decodedToken = decoded;
        res.locals.accessToken = true;
        next();
    }
    catch(err){
        res.locals.accessToken = false;
       return res.json({success: false, msg: err.message});
    }   
    
}


const refreshToken = async(req, res) => {
    //let refresh = false;
    try{
    let token = req.body.token;
    let decodedToken = await jwt.verify(token, key);
    return res.json ({success: true, accessToken: token, refreshToken:  req.body.refreshToken});
    //refresh = true;
    }
    catch(err){
        let rToken = req.body.refreshToken;
        let key = config.connAttr.secretKeyRefresh;
        try{
            let decoded = await jwt.verify(rToken, key);
            let token = await jwt.sign({id:decoded.id}, config.connAttr.secretKey, {expiresIn:1000});
            //res.locals.decodedToken = decoded;
            //next();
            return res.json({success: true, accessToken: token, refreshToken: rToken});
        }
        catch(err){
            return res.json({success: false, message: "You Need To Log In"});
        }
    }
}
router.post('/', async(req, res) => refreshToken(req, res));
module.exports = {verfiyToken, refreshToken, router};