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
const { eventParticipantController } = require('./eventParticipantController');
const mwares = require("../auth/auth");

class eventController extends Con.Controller {

        
    insertEvent=async(req,res)=>{
        req.body['USER_ID'] = res.locals.decodedToken['id'];
        let result = await this.insert(req, res, "EVENT", req.body);
        return res.json(result);
    };



    getEvents=async(req,res)=>{

        let orderedEvents = [];
        let events = await this.get(req, res, "EVENT", req.body);
        if (events['success']==true)
        {orderedEvents = this.order( events['rows']);
        return res.json(orderedEvents);}
        else 
        return res.json(events);



    };

    deleteEvent=async(req,res)=>{
         req.body['USER_ID'] = res.locals.decodedToken['id'];
        // let eventParticipants = await this.get(req,res, "EVENT_PARTICIPANT", {event_id : req.body['id']});
        // let deleted;
        // if (eventParticipants['rows']){
        //     for (let i=0;i<eventParticipants['rows'].length;i++)
        //         deleted = await this.delete(req,res, "EVENT_PARTICIPANT", eventParticipants['rows'][i]);
        // }
        let rows = await this.delete(req,res, "EVENT", req.body);
        return res.json(rows);
    };

    updateEvent=async(req,res)=>{
        req.query['USER_ID'] = res.locals.decodedToken['id'];
        let updated = await this.update(req, res, "EVENT", req.body, req.query);
        return res.json(updated);
       }; 

}
let con = new eventController();
router.post('/insert', mwares.verfiyToken, async(req, res) => con.insertEvent(req, res));
router.put('/update', mwares.verfiyToken, async(req, res)=>con.updateEvent(req, res));
router.get('/get', async(req, res)=>con.getEvents(req,res));
router.delete('/delete', mwares.verfiyToken, async(req, res)=>con.deleteEvent(req,res));

module.exports= router;