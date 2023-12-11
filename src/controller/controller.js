const express = require('express');
const oracledb = require('oracledb');
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
const dbconnection = require('../../config/db');
const auth = require('../auth/auth');
const Model = require('../model/model');
var router = express.Router();

let connAttr = dbconnection.connAttr;



class Controller {

    order(p){
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
        for (let i=0; i<n-1; i++){
            for (let j = 0; j < n - i - 1; j++){
                
                if ((timeStamp[j]) < (timeStamp[j+1])){
                    let b = timeStamp[j];
                    timeStamp[j] = timeStamp[j+1];
                    timeStamp[j+1] = b;
                    b = p[j];
                    p[j] = p[j+1];
                    p[j+1] = b;
                }
            }
        }
        return p;
    };

    datetime(){

        let date=new Date();
        let day = ("0" + date.getDate()).slice(-2);;
        let month = ("0" + (date.getMonth() + 1)).slice(-2);
        let year = date.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;


    };
    insert=async(req, res, tabl, params)=>{
        let connection;
        try{
            connection = await oracledb.getConnection(connAttr);
            let model =  new Model(connection, tabl);
            let result = await model.insert(params);
            if (result['success'] == false)
                return result;
            result = result['answer'];
            return {success: true, rowsAffected: result.rowsAffected};
        }
        catch(err){ 
            console.log(err);
        return {success: false, msg : err.message};
        }
        finally{
            await connection.release();
        }

    };
    update=async(req, res, tabl, updatedValues, updateCond)=>{
        let connection;
        try{
            connection = await oracledb.getConnection(connAttr);
            let model =  new Model(connection,tabl );
            let result = await model.update(updatedValues, updateCond);
            if (result['success'] == false)
                return result;
            result = result['answer'];


            return {success: true, rowsAffected: result.rowsAffected};
        }
        catch(err){ 
            console.log(err);
            return {success: false, msg : err.message};
        }
        finally{
            await connection.release();
        }

    };

    get=async(req, res, tabl, params)=>{
        let connection;
        try{
            connection = await oracledb.getConnection(connAttr);
            let model =  new Model(connection, tabl);;
            let result = await model.get(params);
            if (result['success'] == false)
                return result;
            result = result['answer'];
            if(result.rows.length==0) // for rows
                { 
                    result.rows = [];
                   // return {success: false , msg: "there is nothing there"};
                }
                return {success: true , rows: result.rows};
        }
        catch(err){ 
            console.log(err);
            return {success: false, msg : err.message};
        }
        finally{
            await connection.release();
        }

    };

    delete= async(req, res, tabl, params)=>{
        let connection;
        try{
            connection = await oracledb.getConnection(connAttr);
            let model =  new Model(connection, tabl);;
            let result = await model.delete(params);
            if (result['success'] == false)
                return result;
            result = result['answer'];
            return {success: true, rowsAffected : result.rowsAffected};
        }
        catch(err){ 
            console.log(err);
            return {success: false, msg : err.message};
        }
        finally{
            await connection.release();
        }

    };


};



module.exports = {router,Controller};