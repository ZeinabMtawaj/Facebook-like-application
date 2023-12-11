const { request } = require('express');
const express = require('express');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbconnection = require('../../config/db');
const auth = require('../auth/auth');
const Model = require('../model/model');
var router = express.Router();
const Con=require('./controller');
const { FriendShipController } = require('./friendShipController');
let connAttr = dbconnection.connAttr;
const mwares = require("../auth/auth");


class userController extends Con.Controller {

    validateEmail (emailAdress){
        let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (emailAdress.match(regexEmail)) {
        return true; 
    } else {
        return false; 
    }
    };
        
    insertUser=async(req,res)=>{
        let params=req.body;
        if (!this.validateEmail(params['email']))
            return res.json({success: false, msg: " invalid email"});
        params['create_date']= this.datetime();
        let result = await this.insert(req, res, "USER", params);
      
        return res.json(result);
    };


    getUsers=async(req,res)=>{
        let id = res.locals.decodedToken['id'];
        let user = await this.get(req, res, "USER", {"ID" : id});
        if (user['rows'].length==0)
             return res.json({success: false, msg: "not allowed" });
        if (!user['success'])
            return res.json(user);
        let users = await this.get(req, res, "USER", req.body);
        return res.json(users);
    };

    deleteUser =async(req,res)=>{
        req.body['USER_ID'] = res.locals.decodedToken['id'];
        let user = await this.delete(req,res, "USER",{"ID": req.body['USER_ID']});
        return res.json(user);
    };

    updateUser=async(req,res)=>{
        req.query['ID'] = res.locals.decodedToken['id'];
        let updated = await this.update(req, res, "USER", req.body, req.query);
        return res.json(updated);
       }; 

}
let con = new userController();
router.post('/insert', async(req, res) => con.insertUser(req, res));
router.put('/update', mwares.verfiyToken, async(req, res)=>con.updateUser(req, res));
router.get('/get', mwares.verfiyToken, async(req, res)=>con.getUsers(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteUser(req,res));

module.exports= {router, userController};