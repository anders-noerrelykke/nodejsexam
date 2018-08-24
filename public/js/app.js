//PAGE IDENTIFICATION AND BASIC ROUTES
var root = "";
if (window.location.port == 0) {
    root = "http://"+window.location.hostname+'/';
}else{
    root = "http://"+window.location.hostname+":"+window.location.port+'/';
}

thisUser = "";

/***************************************************** */
/***************************************************** */

//NAV

function readyNew(){
    document.querySelector('#newPostBox').style.display = 'flex';
}

function readyShow(id){
    document.querySelector('#showPostBox').style.display = 'flex';
    doAjax(
        'GET',
        '/get-post/'+id,
        function(res){
            document.querySelector('#commentsList').innerHTML = ""
            postData = JSON.parse(res)
            document.querySelector('#showPostTitle').innerHTML = postData.title
            document.querySelector('#showPostContent').innerHTML = postData.content
            if(postData.comment) {
                for(let i = 0; i < postData.comment.length; i++){
                    document.querySelector('#commentsList').innerHTML += "- "+postData.comment[i]+"<br>"
                }
            }
        }
    )
    document.querySelector('#postNewComment').addEventListener('click', function(){
        postComment(id)
    })
}

function closeBox(boxId){
    document.querySelector('#'+boxId).style.display = 'none'

}


/***************************************************** */
/***************************************************** */


const stored_tempId = localStorage.getItem('nodeTempId')
validateTempId(stored_tempId)

function validateTempId(stored_tempId){
    doAjax(
        'GET',
        '/validate-tempId/'+stored_tempId,
        function(res){
            userData = JSON.parse(res)
            thisUser = userData.user
            getAllPosts()
            fillOutUser()
            switch(window.location.href){
                case root+'overview':
                    if(!stored_tempId){
                        window.location = root
                    }
                    break
                case root:
                    if(stored_tempId){
                        window.location = root+'overview'
                    }
                    break
            }
        }
    )
}

function fillOutUser(){
    userBox = document.querySelector('#whoIsIt')
    console.log(thisUser)
    if(userBox){
        if(thisUser.image){
            try{document.querySelector('#whoIsItImage').src = thisUser.img}catch(err){}
        }else{
            try{document.querySelector('#whoIsItImage').src = '/img/user/anonymous.png'}catch(err){}
        }
        document.querySelector('#whoIsItName').innerHTML = thisUser.firstname+" "+thisUser.lastname
        document.querySelector('#whoIsItEmail').innerHTML = thisUser.email
        document.querySelector('#whoIsItPhone').innerHTML = thisUser.phone
        document.querySelector('#whoIsItRole').innerHTML = thisUser.role
        
    }
}

function login(){
    var formData = new FormData(formLogin)
    doAjax(
    'POST',
    '/login/',
    function(res){
        userInfo = JSON.parse(res)
        console.log(userInfo)
        errorBox = document.querySelector('#loginErrorMessage')
        if(userInfo.status == "err"){
            errorBox.innerHTML = "Wrong username or password."
            setTimeout(function(){
                errorBox.style.display = "none"
            }, 3000)
            return
        }
        localStorage.setItem('nodeTempId', userInfo.user.tempId);
        errorBox.innerHTML = "Login succesful."
        setTimeout(function(){
            errorBox.style.display = "none"
        }, 3000)
        window.location = root+'overview'
    },
    formData)
}

function logOut(){
    localStorage.removeItem('nodeTempId');
    window.location = root;
}

/***************************************************** */
/***************************************************** */

function createUser(){
    var formData = new FormData(formSignup)
    console.log(formData)
    doAjax(
    'POST',
    '/create-user/',
    function(res){
        newUser = JSON.parse(res)
        errorBox = document.querySelector('#signupErrorMessage')
        if(newUser.status == "err"){
            errorBox.innerHTML = "Please fill out all fields before submitting data."
            setTimeout(function(){
                errorBox.style.display = "none"
            }, 3000)
        }else{
            errorBox.innerHTML = "User created succesfully. Please login to continue."
            setTimeout(function(){
                errorBox.style.display = "none"
            }, 3000)
        }
        console.log(res)
    },
    formData)
}

/***************************************************** */
/***************************************************** */

function createPost(){
    var formData = new FormData(newPostForm)
    doAjax(
    'POST',
    '/create-post/'+thisUser._id,
    function(res){
        newPost = JSON.parse(res)
        console.log(newPost)
        getAllPosts()
    },
    formData)
}

function getAllPosts(){
    doAjax(
        'GET',
        '/get-all-posts/',
        function(res){
            postData = JSON.parse(res)
            console.log(postData)
            boxList = document.querySelector('#postsList')
            if(boxList){
                boxList.innerHTML = ""
                postData.forEach(post => {
                    answeredButton = ""
                    extraClass = ""
                    if(post.author_id == thisUser._id && post.answered != true){
                        answeredButton = `<button class="btnAnswered" onclick="markAnswer('`+post._id+`')">Mark as answered</button>`
                    }
                    if(post.answered == true){
                        extraClass = " answered"
                    }
                    boxList.innerHTML += `
                    <div class="listItem`+extraClass+`" onclick="readyShow('`+post._id+`')">
                    <h3>`+post.title+`</h3>
                    <p>`+post.content+`</p>
                    `+answeredButton+`
                    </div>`
                })
            }
        }
    )
}

function markAnswer(id){
    doAjax(
        'POST',
        '/mark-answer/'+id,
        function(res){
            console.log(res)
            setTimeout(function(){
                getAllPosts()
            }, 500)
        }
    )
}

function postComment(id){
    formData = new FormData(newComment)
    doAjax(
        'POST',
        '/post-comment/'+id,
        function(res){
            console.log(res)
            setTimeout(function(){
                getAllPosts()
            }, 500)
        },
        formData)
}

/***************************************************** */
/***************************************************** */

//AJAX
function doAjax(method, api, callback, formData) {
    var ajax = new XMLHttpRequest();
    ajax.onreadystatechange = function() {
        if (ajax.readyState == 4 && ajax.status == 200) {
            callback(this.responseText);
        }
    };
    ajax.open(method, api, true)
    if (method == 'POST' && formData) {
        ajax.send(formData)
    } else {
        ajax.send()
    }
}