var express = require('express')
var app = express()

var file = require('file-system')
var fs = require('fs')




port = 2900
app.listen(port, err =>{
    if(err){
        console.log(err)
    }
    console.log("listening on port "+port)
})