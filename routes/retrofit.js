var express = require('express');
var router = express.Router();
const func = require('../CarServer');

let remote2 = "stop";
// import {remote2} from '../CarServer'

router.post('/handle', function (req, res, next) {
    console.log('post 호출 / data : ' + req.body.data);
    console.log('path : ' + req.path);
    res.send('get success')
    
    
    if(req.body.data == "go"){
        remote2 = "go";
        module.exports = {remote2};
    }
    else if(req.body.data == "back"){
        remote = "back";
        console.log(remote);
    }
    else if(req.body.data == "right"){
        remote = "right";
        console.log(remote);
    }
    else if(req.body.data == "left"){
        remote = "left";
        console.log(remote);
    }
    else{
        remote = "stop";
        console.log(remote);
    }
});


module.exports = router;