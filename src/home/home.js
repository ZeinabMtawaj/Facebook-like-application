const express = require('express');
//const mwares = require('../servies/actions');
const jwt = require('jsonwebtoken');
const config = require('../../config/db');
const UserCon = require('../controller/userController');
let router = express.Router();

// router.get("/", mwares.testMiddleware, (req, res)=>{
//     console.log("hi zeinab");
//     return res.json({value: res.locals.myParam});
// });


// router.post("/", function(req, res){
//     let val = req.body.param;
//     return res.json({value_after_add: val + 5});
// });



router.post('/login', async (req, res)=>{
    const email = req.body.email;
    const password = req.body.password;
    let userCon = new UserCon.userController();
    let currentUser = await userCon.get(req, res, "USER", {"EMAIL": email, "PASSWORD": password });
    if (currentUser['rows'].length==0)
        return res.json({success: false, msg:"invlid username or password"});
    else if (!currentUser['success'])
        return res.json(currentUser);
    const key = config.connAttr.secretKey;
    const keyRefresh = config.connAttr.secretKeyRefresh;
    const userDetails = {id : currentUser['rows'][0]['ID']};  
    try{
        const token = await jwt.sign(userDetails, key, {expiresIn:10000});
        const refreshToken = await jwt.sign(userDetails, keyRefresh, {expiresIn:86400});
        return res.json({success: true, accessToken: token, refreshToken: refreshToken});
    }
    catch(err){
        console.log(err);
        return res.json({success: false, msg: err.message});
    }

});





module.exports = router;
