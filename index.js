const express = require('express');

var app = express();
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

// const home = require('./src/home/home');
// app.use('/', home);


// const employee = require('./src/employee/employee');
// const insert = require('./src/model/model');
// app.use('/employee', employee);

// const con = require('./src/controller/controller');
// app.use('/', con.router);

const pcon = require('./src/controller/postController');
app.use('/postController', pcon);

const fcon = require('./src/controller/friendShipController');
app.use('/friendShipController', fcon.router);

const rcon = require('./src/controller/requestController');
app.use('/requestController', rcon);

const commCon = require('./src/controller/commentController');
app.use('/commentController', commCon);

const likeCon = require('./src/controller/likeController');
app.use('/likeController', likeCon);

const MessagCon = require('./src/controller/messageController');
app.use('/messageController',  MessagCon);

const UserCon = require('./src/controller/userController');
app.use('/userController',  UserCon.router);

const EventCon = require('./src/controller/eventController');
app.use('/eventController',  EventCon);

const EventPrCon = require('./src/controller/eventParticipantController');
app.use('/eventParticipantController',  EventPrCon);

const refreshToken = require('./src/auth/auth');
app.use('/refreshToken', refreshToken.router);

const logIn = require('./src/home/home');
app.use('/', logIn);



var port = 4000;

app.listen(port, ()=>{
    console.log("The web server is ready on port: " + port);
});

// mod = require('./src/model/model');
// obj = {"id": 5, "name": "John"};
// let v = new mod();
// v.insert(obj);