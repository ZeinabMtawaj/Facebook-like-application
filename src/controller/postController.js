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


class postController extends Con.Controller {

    mostImportantorder(p){
        let n = p.length;
        var timeStamp = [];
        for(let i=0; i<n; i++){
            let obj=p[i];  
            let s = obj['DATETIME'].split(' ');
            let date = s[0].split("-");
            let time = s[1]?.split(":");
            for (let i=0; i<time.length; i++)
             if (time[i].length == 1)
                time[i] = "0" + time[i];
            let dattim = date[0] + date[1] + date[2] + time[0] + time[1] + time[2];
            timeStamp[i] = Number(dattim);
        }    
        let b;
        for (let i=0; i<n-1; i++){
            for (let j = 0; j < n - i - 1; j++){
                if ((p[j]['COMMENTS']) < (p[j+1]['COMMENTS'])){
                    b = p[j];
                    p[j] = p[j+1];
                    p[j+1] = b;
                }
                else if ((p[j]['COMMENTS']) == (p[j+1]['COMMENTS'])){
                    if ((p[j]['LIKES']) < (p[j+1]['LIKES'])){
                        b = p[j];
                        p[j] = p[j+1];
                        p[j+1] = b;
                    }
                    else if ((p[j]['LIKES']) == (p[j+1]['LIKES'])){
                        if ((timeStamp[j]) < (timeStamp[j+1])){
                            b = timeStamp[j];
                            timeStamp[j] = timeStamp[j+1];
                            timeStamp[j+1] = b;
                            b = p[j];
                            p[j] = p[j+1];
                            p[j+1] = b;
                        }                        
                    }
               }

            }
        }
        return p;


    }

    insertPost=async(req,res)=>{
        let params=req.body;
        params['datetime']= this.datetime();
        params['USER_ID'] = res.locals.decodedToken['id'];
        let result = await this.insert(req, res, "POST", params);
        return res.json(result);
    };

    getLatestPosts=async(req,res)=>{ 
        let frcon = new FriendShipController();
        let friends = [];
        req.body["USER_ID"] = res.locals.decodedToken['id'];
        friends = await frcon.getFriends(req, res,{"USER1_ID": req.body["USER_ID"]});
        if(!friends['success'])
            return res.json(friends);
        friends = friends['friends'];
        let first = {
            "USER_ID" : req.body['USER_ID']
        };
        let result = await this.get(req, res, "POST", first);
        if (!result['success'])
            return res.json(result);
        let myPosts = [];
        if (result['success'] == true){
            myPosts = result['rows'];
        }
        let j=0;
        let OtherPosts = [];
        for (let i=0; i<friends.length ;i++){
            result = await this.get(req, res, "POST",friends[i]);
                if (!result['success'])
                return res.json(result)
                OtherPosts[j] = result['rows'];
                j++;   
        }
        let totalPosts = [];
        totalPosts = [...totalPosts, ...myPosts];
        for (let i=0; i<OtherPosts.length; i++){
            totalPosts = [...totalPosts, ...OtherPosts[i]]; 
        }
        let orderedPosts = this.order( totalPosts);
        return res.json({success: true, posts: orderedPosts});
    };

    getMostImportantPosts=async(req,res)=>{ 
        let frcon = new FriendShipController();
        let friends = [];
        req.body["USER_ID"] = res.locals.decodedToken['id'];
        friends = await frcon.getFriends(req, res,{"USER1_ID": req.body["USER_ID"]});
        
        if(!friends['success'])
            return res.json(friends);
        friends = friends['friends'];
        let first = {
            "USER_ID" : req.body['USER_ID']
        };

        let result = await this.get(req, res, "POST", first);
        if (!result['success'])
            return res.json(result);
        let myPosts = [];

        if (result['success'] == true){
            myPosts = result['rows'];
        }
        let j=0;
        let OtherPosts = [];
        for (let i=0; i<friends.length ;i++){
            result = await this.get(req, res, "POST",friends[i]);
            if (!result['success'])
                return res.json(result);
            //if (result['success'] == true){
                OtherPosts[j] = result['rows'];
                j++;   
           // }
        }
        let totalPosts = [];
        totalPosts = [...totalPosts, ...myPosts];
        for (let i=0; i<OtherPosts.length; i++){
            totalPosts = [...totalPosts, ...OtherPosts[i]]; 
        }
        let orderedPosts = this.mostImportantorder( totalPosts);
        return res.json({success: true, posts: orderedPosts});
    };

    deletePost=async(req,res)=>{
        req.body["USER_ID"] = res.locals.decodedToken['id'];
        let rows = await this.delete(req,res, "POST", req.body);
        return res.json(rows);
    };

    updatePost=async(req,res)=>{
        req.query["USER_ID"] = res.locals.decodedToken['id'];
        let updated = await this.update(req, res, "POST", req.body, req.query);
        return res.json(updated);
       }; 

    getAllPosts=async(req,res)=>{
        let result = await this.get(req, res, "POST", req.body);
        return res.json(result);
    };

}
let con = new postController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertPost(req, res));
router.put('/update', mwares.verfiyToken, async(req, res)=>con.updatePost(req, res));
router.get('/getLatest', mwares.verfiyToken,async(req, res)=>con.getLatestPosts(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deletePost(req,res));
router.get('/getPosts', async(req, res)=>con.getAllPosts(req,res));
router.get('/getMostImportant', mwares.verfiyToken,async(req, res)=>con.getMostImportantPosts(req,res));


module.exports= router;