const { message } = require('express');
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
const e = require('express');


class messageController extends Con.Controller {

    insertMessage=async(req,res)=>{
        let params=req.body;
        params['datetime']= this.datetime();
        params['STATUS']= 0;
        params['SENDER_ID'] = res.locals.decodedToken['id'];
        let result = await this.insert(req, res, "MESSAGE", params);
        return res.json(result);
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

    };

    getMessages = async(req, res)=>{
    
        let orderedMessages = [];
        let params = Object.assign({},req.body);
        params['SENDER_ID'] = res.locals.decodedToken['id'];
        let sendingMessages = [];
        let messages;
        messages = await this.get(req, res, "MESSAGE", params);
        if (messages['success']==true)
            sendingMessages = messages['rows'];
        else
           return res.json(messages);
        params = req.body;
        params['RECEIVER_ID'] = res.locals.decodedToken['id'];
        messages = await this.get(req, res, "MESSAGE", params);
        let receivingMessages = [];
        let updated;
        if (messages['success']==true){
            receivingMessages = messages['rows'];
            for(let i=0; i<receivingMessages.length; i++){
                //if (receivingMessages[i]['RECEIVER_ID']==params['SENDER_ID'] ){
                updated = await this.update(req, res, "MESSAGE", {status : 1}, {id : receivingMessages[i]['ID']});           
                receivingMessages[i]['STATUS']=1;
                //}
            }
        }
        else
            return res.json(messages);
        messages = [];
        messages = [...sendingMessages,...receivingMessages];
        orderedMessages = this.order( messages);
        return res.json({success:true, "messages": orderedMessages});
    };



    getSendingMessages = async(req,res)=>{
        let params = req.body;
        params['SENDER_ID'] = res.locals.decodedToken['id'];
        let result = await this.get(req, res, "MESSAGE", params);
        if (result['success']==true){
                let filter = this.filtr(result['rows'], 'SENDER_ID', params);
                let  orderedMessages = this.order(filter);
                return res.json({success:true, "messages": orderedMessages});
        }
        else{
           return res.json(result);
        }
    };

    getReceivingMessages = async(req,res)=>{
        let params = req.body;
        params['RECEIVER_ID'] = res.locals.decodedToken['id'];
        let result = await this.get(req, res, "MESSAGE", params);
        if (result['success']==true){
             let filter = this.filtr(result['rows'], 'RECEIVER_ID', params);
            let  orderedMessages = this.order(filter);
            let updated;
            for(let i=0; i<orderedMessages.length; i++){
                updated = await this.update(req, res, "MESSAGE", {status : 1}, {id : orderedMessages[i]['ID']});           
                orderedMessages[i]['STATUS']=1;
            }
            return res.json({success:true, "messages": orderedMessages});
     }
        else{
            return res.json({success: false, msg: "there is nothing there"}); 
        }
       
    };   
        
    deleteMessage=async(req,res)=>{
        let currentUser = res.locals.decodedToken['id'];
        let messages = await this.get(req, res, "MESSAGE", req.body);
        if (messages['success']){
            for (let i=0; i<messages['rows'].length; i++){
                if ((messages['rows'][i]['SENDER_ID']!=currentUser)&&(messages['rows'][i]['RECEIVER_ID']!=currentUser))
                    return res.json({success:false,msg:"not authorized, please check the body of the request"});
            }
        }
        else 
            return messages;
        let rows = await this.delete(req,res, "MESSAGE", req.body);
        return res.json(rows);


        
    };
    
    updateMessage=async(req,res)=>{
        req.query['SENDER_ID'] = res.locals.decodedToken['id'];
        let updated = await this.update(req, res, "MESSAGE", req.body, req.query);
        return res.json(updated);
       }; 

}
let con = new messageController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertMessage(req, res));
router.put('/update', mwares.verfiyToken, async(req, res)=>con.updateMessage(req, res));
router.get('/get', mwares.verfiyToken, async(req, res)=>con.getMessages(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteMessage(req, res));
router.get('/getSendingmessages', mwares.verfiyToken, async(req, res) => con.getSendingMessages(req, res));
router.get('/getReceivingmessages', mwares.verfiyToken, async(req, res) => con.getReceivingMessages(req, res));


module.exports= router;