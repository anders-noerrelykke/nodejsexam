
var post = {}

/***************************************************** */
/***************************************************** */

post.createPost = (postData, fCallback) => {
    global.db.collection('posts')
    .insertOne(postData, (err, res) => {
        if(err){
            return fCallback(true)
        }else{
            return fCallback(false, res)
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

module.exports = post