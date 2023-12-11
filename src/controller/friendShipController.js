const { request } = require('express');
const express = require('express');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbconnection = require('../../config/db');
const auth = require('../auth/auth');
const Model = require('../model/model');
var router = express.Router();
const Con=require('./controller');
let connAttr = dbconnection.connAttr;
const mwares = require("../auth/auth");

class FriendShipController extends Con.Controller {

///////////
    getMyFriendsResponse=async(req,res)=>{
        req.body['USER1_ID'] = res.locals.decodedToken['id'];
        let friends = await this.getFriends(req, res, req.body);
        if(!friends['success'])
            return friends;
        if (friends['friends'].length != 0)
            return res.json(friends['friends']);
        else
            return res.json({success: false, msg: "there is nothing there"});
    };

    getFriendsResponse=async(req,res)=>{
        let friends = await this.getFriends(req, res, req.body);
        if(!friends['success'])
            return friends;
        if (friends['friends'].length != 0)
            return res.json(friends['friends']);
        else
            return res.json({success: false, msg: "there is nothing there"});
    };


    getFriends=async(req, res, params)=>{
        let result = await this.get(req, res, "FRIENDSHIP", params);
        if (!result['success'])
            return result;
        let totalResult = [];
        let first = [];
        let second = [];
        if (result['success'] == true){
            first = result['rows'];
        }
        if (!params["USER1_ID"])
            return {success: true, friends : first};
        result = await this.get(req, res, "FRIENDSHIP", {"USER2_ID" : params["USER1_ID"]});
        if (!result['success'])
            return result;
        if (result['success'] == true){
            second = result['rows'];
        }
        totalResult = [...first, ...second];
        let friends = [];
        for (let i=0; i<totalResult.length; i++){
            if ( totalResult[i]['USER1_ID'] == params['USER1_ID'])
            friends[i] = {
                "USER_ID" : totalResult[i]['USER2_ID']
            }
            else
            friends[i] = {
                "USER_ID" : totalResult[i]['USER1_ID']
            }

        }
        return ({success: true, friends : friends});
        
        // else {
        // return res.json({success: false, msg: "there is nothing there"});
        // }
    
    };

    

    deleteFriend=async(req,res)=>{
        req.body['USER1_ID'] = res.locals.decodedToken['id'];
        let rows = await this.delete(req,res, "FRIENDSHIP", req.body);
        if(!rows['success'])
            return res.json(rows);
        let user1 = req.body['USER1_ID'];
        // if (req.body['USER2_ID']){
        let user2 = req.body['USER2_ID'];
        rows = await this.delete(req, res, "FRIENDSHIP", {"USER2_ID": user1, "USER1_ID": user2});
        // }
        // else{
        //     rows = await this.delete(req, res, "FRIENDSHIP", {"USER2_ID": user1}); 
        // }
        return res.json(rows);
    };
};
let con = new FriendShipController();
//router.post('/insert', (req, res) => con.insertt(req, res, "FRIENDSHIP", params));
//router.post('/update', async(req, res)=>con.updat(req,res));
router.get('/getMyFriends', mwares.verfiyToken, async(req, res)=>con.getMyFriendsResponse(req,res));
router.get('/getFriends', mwares.verfiyToken, async(req, res)=>con.getFriendsResponse(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteFriend(req, res));

module.exports= {router,FriendShipController};