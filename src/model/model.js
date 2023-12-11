const res = require("express/lib/response");
const { json } = require("express/lib/response");

class Model {
    constructor(conn, tab){
        this.table=tab;
        this.connection=conn;
    }

    async insert(cols){
        let result;
        try{
            let keys = Object.keys(cols);
            let query = 'insert into "' + this.table + '" (';
            for (let i=0; i<keys.length; i++){
                query += keys[i];
                if (i != keys.length-1)
                    query += ', ';
            }
            query +=') values (';
            for (let i=0; i<keys.length; i++){
                let index = keys[i];
                query += "'";
                query += cols[index];
                query += "'";
                if (i != keys.length-1)
                    query += ', ';
            }
            query += ')';
            result = await this.connection.execute(query, {}, {autoCommit: true});
        }
        catch(err){
           // result = "Success: false, msg: " + err.message;
            return {success: false , msg: err.message};
        }
        return {success: true , answer: result};
        
    }

    async update(cols, cond){
        let result;
        try{
            let keys = Object.keys(cols);
            let query = 'update "' + this.table + '" set ';
            for (let i=0; i<keys.length; i++){
                query += keys[i];
                query += " = '";
                query += cols[keys[i]];
                query += "'";
                if (i != keys.length-1)
                    query += ', ';
            }
            query += " where " ;
            let keys2 = Object.keys(cond);
            for (let i=0; i< keys2.length; i++){
                query += keys2[i];
                query += " = '";
                query += cond[keys2[i]];
                query += "'";
                if (i != keys2.length-1)
                    query += ' and ';
            }
            //console.log(query);
            result = await this.connection.execute(query, {}, {autoCommit: true});

        }
        catch(err){
           // result = "Success: false, msg: " + err.message;
           return {success: false , msg: err.message};
        }
        //return result;
        return {success: true , answer: result};

        
    }

    async get(cols){
        let result;
        try{
            let keys = Object.keys(cols);
            let query = 'select * from "' + this.table +'"'; 
            if (keys.length>0)
                query += ' where ';
            for (let i=0; i<keys.length; i++){
                query += keys[i];
                query += "='";
                query += cols[keys[i]];
                query += "'";
                if (i != keys.length-1)
                    query += ' and ';
            }
            result = await this.connection.execute(query, {}, {autoCommit: true});
        }
        catch(err){
            //result = "Success: false, msg: " + err.message;
            return {success: false , msg: err.message};
        }
        //return result;
        return {success: true , answer: result};

        
    }

    async delete(cols){
        let result;
        try{
            let keys = Object.keys(cols);
            let query = 'delete from "' + this.table + '" where ';
            for (let i=0; i<keys.length; i++){
                query += keys[i];
                query += "='";
                query += cols[keys[i]];
                query += "'";
                if (i != keys.length-1)
                    query += ' and ';
            }
            result = await this.connection.execute(query, {}, {autoCommit: true});
        }
        catch(err){
            return {success: false , msg: err.message};
           // result = "Success: false, msg: " + err.message;
        }
        //return result;
        return {success: true , answer: result};

        
    }



}
module.exports = Model;