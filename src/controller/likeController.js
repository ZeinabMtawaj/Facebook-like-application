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

class likeController extends Con.Controller {

    
        
    insertLike=async(req,res)=>{

        let params=req.body;
        params['datetime']= this.datetime();
        params['USER_ID'] = res.locals.decodedToken['id'];
        let getPost = await this.get(req, res, "POST",{id : params['POST_ID']});
        if (!getPost['success'])
            return res.json(getPost);
        if (getPost['rows'].length==0)
             return res.json({success : false, msg : "no such post"});
        let likes = Number(getPost['rows'][0]['LIKES'])+1;
        let updatePost = await this.update(req, res, "POST",{likes : likes} , {id : params['POST_ID']});
        if (!updatePost['success'])
            return res.json(updatePost);
        let result = await this.insert(req, res, "LIKE", params);
        return res.json(result);
    };



    getLikes=async(req,res)=>{

        let orderedLikes = [];
        let likes = await this.get(req, res, "LIKE", req.body);
        if (likes['success']==true){
            orderedLikes = this.order( likes['rows']);
            return res.json({success: true, likes: orderedLikes});
        }
        else 
            return res.json(likes);
    };

    deleteLike=async(req,res)=>{
        req.body['USER_ID'] = res.locals.decodedToken['id'];
        let like = await this.get(req, res, "LIKE",req.body);
        let getPost = await this.get(req, res, "POST",{id : like['rows'][0]['POST_ID']});
        if (!getPost['success'])
            return res.json(getPost);
        if (getPost['rows'].length==0)
             return res.json({success : false, msg : "no such post"});
        let likes = Number(getPost['rows'][0]["LIKES"])-1;
        let updatePost = await this.update(req, res, "POST",{likes : likes} , {id : like['rows'][0]['POST_ID']});
        if (!updatePost['success'])
            return res.json(updatePost);
        let rows = await this.delete(req,res, "LIKE", req.body);
        return res.json(rows);
    };


};
let con = new likeController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertLike(req, res));
router.get('/get', async(req, res)=>con.getLikes(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteLike(req,res));

module.exports= router;