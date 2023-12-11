const { request } = require('express');
const express = require('express');
const { json } = require('express/lib/response');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbconnection = require('../../config/db');
const auth = require('../auth/auth');
const Model = require('../model/model');
var router = express.Router();
const Con= require('./controller');
let connAttr = dbconnection.connAttr;
const frndShpCon = require('./friendShipController');
const mwares = require("../auth/auth");


class requestController extends Con.Controller {

    insertRequest=async(req,res)=>{
        // let s=req.body;
        // if (req.body['SENDER_ID'] == req.body['RECEIVER_ID']){
        //     return res.json({success: false, msg: "could not request to yourself"});
        // }
        // //let result = await this.getRequests(req.body);
        // let result = await this.get(req, res, "REQUEST", req.body);
        // if (result['success']==true){
        //     return res.json({success: false, msg: "could not request, it is already there"}); 
        //     }
        // let sender = req.body['RECEIVER_ID'];
        // let receiver = req.body['SENDER_ID'];
        // //result = await this.getRequests({"SENDER_ID": sender, "RECEIVER_ID": receiver});
        // result = await this.get(req, res, "REQUEST", {"SENDER_ID": sender, "RECEIVER_ID": receiver});
        // if (result['success']==true){
        //         return res.json({success: false, msg: "could not request, it is already there"}); 
        // }

        let params = req.body;
        params['status'] = 0;
        params['SENDER_ID'] = res.locals.decodedToken['id']; 
        params['datetime'] = this.datetime();
        let rows = await this.insert(req, res, "REQUEST", params);
        return res.json(rows);

    };

    filtr(result, properity, value){
        let filter = []; 
        let j = 0;
        for (let i=0; i<result.length; i++){
            let s = result[i];
            let prop=  value;
            if (s[properity] == prop[properity]){
                filter[j] = s;
                j++;
            }
        } 
        return filter;

    }

    getRequests = async(req, res)=>{
        let orderedRequests = [];
        let params = Object.assign({},req.body);
        params['SENDER_ID'] = res.locals.decodedToken['id'];
        let sendingRequests = [];
        let requests;
        requests = await this.get(req, res, "REQUEST", params);
        if (requests['success'])
            sendingRequests = requests['rows'];
        else
           return res.json(requests);
        params = req.body;
        params['RECEIVER_ID'] = res.locals.decodedToken['id'];
        requests = await this.get(req, res, "REQUEST", params);
        
        let receivingRequests = [];
        if (requests['success'])
            receivingRequests = requests['rows'];
        else
            return res.json(requests);
        requests = [];
        requests = [...sendingRequests,...receivingRequests];
        orderedRequests = this.order( requests);
        return res.json({success:true, requests:orderedRequests});
    };
    



    getSendingRequests = async(req,res)=>{
        req.body['SENDER_ID'] = res.locals.decodedToken['id'];
        let result = await this.get(req, res, "REQUEST", req.body);
        if (result['success']){
                let filter = this.filtr(result['rows'], 'SENDER_ID', req.body);
                let orderedRequests = this.order(filter);
                return res.json({success:true, SendingRequests: orderedRequests});
        }
        else{
           return res.json(result);
        }
    };

    getReceivingRequests = async(req,res)=>{
        req.body['RECEIVER_ID'] = res.locals.decodedToken['id'];
        let result = await this.get(req, res, "REQUEST", req.body);
        if (result['success']==true){
            let filter = this.filtr(result['rows'], 'RECEIVER_ID', req.body);
            let orderedRequests = this.order(filter);
            return res.json({success:true, ReceivingRequests: orderedRequests});
     }
        else{
            return res.json({success: false, msg: "there is nothing there"}); 
        }
       
    };   
    
    acceptRequest=async(req, res)=>{
        let params = req.query;
        params['RECEIVER_ID'] = res.locals.decodedToken['id'];
        let updatedValues = { "STATUS" : 1 };
        let updated = await this.update(req, res, "REQUEST", updatedValues, params);
        if (!updated['success'])
            return res.json(updated);
        //if (updated['success']){
        let frCon = new frndShpCon.FriendShipController();
        let obj = {
            "USER1_ID" : params['SENDER_ID'],
            "USER2_ID" : params['RECEIVER_ID']
        };
        let rows = await frCon.insert(req, res, "FRIENDSHIP", obj);
        return res.json(rows);
        //}
        // else {
        //     return res.json({success: false, msg : err.message});
        // }
};

    rejectRequest=async(req, res)=>{
        let params = req.query;
        params['RECEIVER_ID'] = res.locals.decodedToken['id'];
        let updatedValues = { "STATUS" : 2 };
        let updated = await this.update(req, res, "REQUEST", updatedValues, params);
        return res.json(updated);
    };






    // updat=async(req,res)=>{ 
    //     let params = req.body;
    //     let cond = req.query;
    //     //let  c = new Con.Controller();
    //    // params['datetime']= c.datetime();
    //     this.update(req, res, "POST", params, cond);
    // };

    
    deleteRequest=async(req,res)=>{
        let params = req.body;
        params['SENDER_ID'] = res.locals.decodedToken['id'];
        let rows = await this.delete(req,res, "REQUEST", req.body);
        return res.json(rows);


        
    };

}
let con = new requestController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertRequest(req, res));
//router.post('/update', async(req, res)=>con.update(req, res, "REQUEST", req.body, req.query));
router.get('/get', mwares.verfiyToken, async(req, res)=>con.getRequests(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteRequest(req, res));
router.get('/getSendingRequests', mwares.verfiyToken, async(req, res) => con.getSendingRequests(req, res));
router.get('/getReceivingRequests', mwares.verfiyToken, async(req, res) => con.getReceivingRequests(req, res));
router.put('/acceptRequest', mwares.verfiyToken, async(req, res) => con.acceptRequest(req, res));
router.put('/rejectRequest', mwares.verfiyToken, async(req, res) => con.rejectRequest(req, res));


module.exports= router;