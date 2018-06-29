const express = require('express')
const app = express()
const port = 8080
const server = app.listen(port, err =>{
    if(err){
        return err
    }
    console.log("listening on port: "+port)
})
const formidable = require('express-formidable')
const http = require('http').Server(app)
const mongo = require('mongodb').MongoClient
const nodemailer = require('nodemailer')
const request = require('request')
const io = require('socket.io').listen(server);
const user = require('./controller/user/user')
const post = require('./controller/post/post')

const uniqid = require('uniqid')
const siteLink = "localhost:2900"


global.db = null;
const sDatabasePath = 'mongodb://arne:mongo123@ds261660.mlab.com:61660/node-exam-project'

mongo.connect(sDatabasePath, (err, db) => {
    if(err) {
      console.log("Couldn't connect to database")
      return false
    }
    console.log("Connected to database!")
    global.db = db
})

app.get('/validate-tempId/:tempId', (req, res) => {
    response = {
        status: "err",
    }
    if(!req.params.tempId){
        response.message = "No tempId to look up"
        return res.json(response)
    }
    user.validateTempId({tempId: req.params.tempId}, (err, user) => {
        if(err){
            return res.json(response)
        }else if(!user){
            response.message = "Invalid tempId - user does not exist"
            return res.json(response)
        }
        response.status = "succes"
        response.user = user
        response.message = "Valid tempId - user exists"
        return res.json(response)
    })
})

app.use(express.static(__dirname+'/public'))
app.use(formidable())

app.post('/login/', (req, res) => {
    let loginInfo = {
        username: req.fields.loginUsername,
        password: req.fields.loginPassword
    }
    user.loginUser(loginInfo, (err, user) => {
        response = {
            status: "err"
        }
        if(err){
            return res.json(response)
        }
        // delete user.password
        response.status = "succes"
        response.user = user
        return res.json(response)
    })
})

/***************************************************** */
/***************************************************** */

app.post('/create-user/', (req, res) => {
    let userData = {
        firstname: req.fields.signupFirstname,
        lastname: req.fields.signupLastname,
        email: req.fields.signupEmail,
        phone: req.fields.signupPhone,
        username: req.fields.signupUsername,
        password: req.fields.signupPassword,
        role: req.fields.signupRole,
        image: req.files.signupImage,
        tempId: uniqid()
    }
    user.createUser(userData, (err, user) => {
        response = {
            status: "err",
        }
        if(err){
            return res.json(response)
        }
        response.status = "success"
        response.user = user
        sendConfirmationEmail(userData)
        sendConfirmationSMS(userData)
        return res.json(response)
    })
})

function sendConfirmationEmail(userData){
    nodemailer.createTestAccount((err, account) => {
        let transporter = nodemailer.createTransport({
            host: 'send.one.com',
            port: 587,
            secure: false,
            auth: {
                user: 'anders@norrelykke.com',
                pass: 'flow160'
            }
        });
        
        let mailOptions = {
            from: 'ErrorThrower <anders@norrelykke.com>',
            to: userData.email,
            subject: 'Hello',
            text: 'Welcome to ErrorThrower! Please join us on '+siteLink+' to post your question and talk to the experts. Best regards ErrorThrower',
            html: '<p>Hi '+userData.firstname+'</p><h1>Welcome to ErrorThrower!</h1><p>Please join us on <a href="'+siteLink+'">'+siteLink+'</a> to post your question and talk to the experts.</p><h3>Best regards</h3><h3>ErrorThrower</h3>'
        };
        
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log("ERRORRRRRRR: "+error);
            }
            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        });
    });
}

function sendConfirmationSMS(userData){
    request.post({
        url: 'https://gatewayapi.com/rest/mtsms',
        oauth: {
            consumer_key: 'OCCYVvDd-fpAd7yUHIUcL18O',
            consumer_secret: 'OoU*nEyK&oksPvmJdFj*lAKqM5TouDG!iDn@YtTV',
        },
        json: true,
        body: {
            sender: 'ErrorThrower',
            message: 'Welcome to ErrorThrower. Check your email ('+userData.email+') for your login-information!',
            recipients: [{msisdn: 4550550187}],
        },
    }, function (err, r, body) {
        console.log(err ? err : body);
    });
}

/***************************************************** */
/***************************************************** */

app.get('/get-all-users/', (req, res) => {
    user.getAllUsers((err, data) => {
        if (err) {
            console.log('err')
            return res.json(false);
        }
        res.json(data);
    });
});

/***************************************************** */
/***************************************************** */

app.post('/create-post/', (req, res) => {
    let postData = {
        title: req.fields.newPostTitle,
        content: req.fields.newPostContent,
        posted_date: new Date(),
        answered: false
    }

})

app.get('/get-all-posts', (req, res) => {
    post.getAllPosts((err, data) => {
        if (err) {
            console.log('err')
            return res.json(false);
        }
        res.json(data);
    })
})

/***************************************************** */
/***************************************************** */

io.on('connection', function(socket){
    console.log(socket.id)
    console.log('a user connected');
    
    socket.on('sendMessage', function(jData){
        socket.emit('receiveMessage', jData);
        socket.broadcast.emit('receiveMessage', jData );
    });
});

/***************************************************** */
/***************************************************** */


// ROUTING
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html')
})

app.get('/overview', function(req, res){
    res.sendFile(__dirname + '/overview.html')
})

// port = 2900
// app.listen(port, err =>{
//     if(err){
//         console.log(err)
//         return err
//     }
//     console.log("listening on port "+port)
// })