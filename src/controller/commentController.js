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

class commentController extends Con.Controller {

        
    insertComment=async(req,res)=>{
        let params=req.body;
        params['datetime']= this.datetime();
        params['USER_ID']= res.locals.decodedToken['id'];
        let getPost = await this.get(req, res, "POST",{id : params['POST_ID']});
        if (!getPost['success'])
            return res.json(getPost);
        if (getPost['rows'].length==0)
             return res.json({success : false, msg : "no such post"});
        let comments = Number(getPost['rows'][0]["COMMENTS"])+1;
        let updatePost = await this.update(req, res, "POST",{comments : comments} , {id : params['POST_ID']});
        if (!updatePost['success'])
            return res.json(updatePost);
        let result = await this.insert(req, res, "COMMENT", params);
      
        return res.json(result);
    };



    getComments=async(req,res)=>{

        let orderedComments = [];
        let comments = await this.get(req, res, "COMMENT", req.body);
        if (comments['success']==true)
        {
            orderedComments = this.order( comments['rows']);        
            return res.json({success: true, comments: orderedComments});
        }
        return res.json(comments);
    };

    deleteComment=async(req,res)=>{
        req.body['USER_ID'] = res.locals.decodedToken['id'];
        let comment = await this.get(req, res, "COMMENT",req.body);
        let getPost = await this.get(req, res, "POST",{id : comment['rows'][0]['POST_ID']});
        if (!getPost['success'])
            return res.json(getPost);
        if (getPost['rows'].length==0)
             return res.json({success : false, msg : "no such post"});
        let comments = Number(getPost['rows'][0]["COMMENTS"])-1;
        let updatePost = await this.update(req, res, "POST",{comments : comments} , {id : comment['rows'][0]['POST_ID']});
        if (!updatePost['success'])
            return res.json(updatePost);
        let rows = await this.delete(req,res, "COMMENT", req.body);
        return res.json(rows);
    };

    updateComment=async(req,res)=>{
        req.query['USER_ID'] = res.locals.decodedToken['id'];
        let updated = await this.update(req, res, "COMMENT", req.body, req.query);
        return res.json(updated);
       }; 

}
let con = new commentController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertComment(req, res));
router.put('/update', mwares.verfiyToken, async(req, res)=>con.updateComment(req, res));
router.get('/get', async(req, res)=>con.getComments(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteComment(req,res));

module.exports= router;
