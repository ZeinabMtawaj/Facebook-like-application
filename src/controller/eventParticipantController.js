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

class eventParticipantController extends Con.Controller {

        
    insertEventPr=async(req,res)=>{
        req.body['user_id'] = res.locals.decodedToken['id'];
        let result = await this.insert(req, res, "EVENT_PARTICIPANT", req.body);     
        return res.json(result);
    };

    getEventPrs=async(req,res)=>{
        let eventPrs = await this.get(req, res, "EVENT_PARTICIPANT", req.body);
        return res.json(eventPrs);
    };

    deleteEventPr=async(req,res)=>{
        req.body['user_id'] = res.locals.decodedToken['id'];
        let rows = await this.delete(req,res, "EVENT_PARTICIPANT", req.body);
        return res.json(rows);
    };

    // updateEventPrs=async(req,res)=>{
    //     let updated = await this.update(req, res, "EVENT_PARTICIPANT", req.body, req.query);
    //     return res.json(updated);
    //    }; 

}
let con = new eventParticipantController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertEventPr(req, res));
router.get('/get', async(req, res)=>con.getEventPrs(req,res));
router.delete('/delete',  mwares.verfiyToken, async(req, res)=>con.deleteEventPr(req,res));

module.exports= router;