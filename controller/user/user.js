const fs = require('fs');
const ObjectId = require('mongodb').ObjectId;
const uniqid = require('uniqid')

var user = {};

/***************************************************** */
/***************************************************** */

user.loginUser = (loginInfo, fCallback) => {
    global.db
    .collection('users')
    .findOne(loginInfo, (err, user) => {
        if(err){
            return fCallback(true, null)
        }else if(!user){
            return fCallback(true, null)
        }
        return fCallback(false, user)
    })
}

user.validateTempId = (tempId, fCallback) => {
    global.db
    .collection('users')
    .findOne(tempId, (err, user) => {
        if(err){
            return fCallback(true, null)
        }else if(!user){
            user = {
                status: 'err',
                message: 'Not a valid tempId'
            }
            return fCallback(true, user)
        }
        return fCallback(false, user)
    })
}

/***************************************************** */
/***************************************************** */

user.createUser = (userData, fCallback) => {
    if (userData.image.size > 0) {
        const imgId = uniqid();
        // If so, define a new path and fs.rename
        const imgName = 'user-' + imgId + '.jpg';
        const imgPath = '/img/user/' + imgName;
        const imgPathAbsolute = 'public' + imgPath;
        userData.img = imgPath;
        fs.renameSync(userData.image.path, imgPathAbsolute);
    }
    global.db.collection('users')
    .insertOne(userData, (err, res) => {
        if(err){
            return fCallback(true)
        }else{
            return fCallback(false, res)
        }
    })
}

user.getAllUsers = fCallback => {
    global.db
      .collection('users')
      .find()
      .toArray((err, data) => {
        if(!err) {
            return fCallback(true)
        }
        return fCallback(false, data)
        
        // Remove sensitive data
        // data.forEach(user => {
        //     delete user.password;
        // });

    })
}

/***************************************************** */
/***************************************************** */

module.exports = user