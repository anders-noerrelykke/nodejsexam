const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;
const uniqid = require('uniqid')

var post = {}

/***************************************************** */
/***************************************************** */

post.createPost = (postData, fCallback) => {
    global.db.collection('posts')
    .insertOne(postData, (err, postData) => {
        if(err){
            return fCallback(true, null)
        }else{
            return fCallback(false, postData)
        }
    })
}

post.getAllPosts = fCallback => {
    global.db.collection('posts')
    .find()
    .toArray((err, data) =>{
        if(err){
            return fCallback(true)
        }
        return fCallback(false, data)
    })
}

post.getPost = (id, fCallback) => {
    id = new ObjectId(id)
    global.db.collection('posts')
    .findOne({_id: id}, (err, postData) => {
        if(err){
            return fCallback(true, err)
        }else if(!postData){
            return fCallback(true, err)
        }
        return fCallback(false, postData)
    })
}

post.markAnswer = (id, fCallback) => {
    id = new ObjectId(id)
    newStatus = {$set: {answered: true}}
    global.db.collection('posts')
    .updateOne({_id: id}, newStatus, (err, post) => {
        if(err){
            return fCallback(true, err)
        }
        return fCallback(false, post)
    })
}

post.postComment = (id, comment, fCallback) => {
    id = new ObjectId(id)
    global.db.collection('posts')
    .updateOne({_id: id}, comment, (err, post) => {
        if(err){
            return fCallback(true, err)
        }
        return fCallback(false, post)
    })
}

module.exports = post