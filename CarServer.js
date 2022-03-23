const fs = require('fs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session); // 세션을 파일에 저장
const cookieParser = require('cookie-parser');

var retrofitRouter = require('./routes/retrofit');

let remote = "stop";
let msg = 0;
let msh = 0;

// var {remote2} = require('./routes/retrofit');
// remote = remote2;

const client = mysql.createConnection({

    user: 'root',
    password: '',
    port: '3306',
    database: 'user'
})

// node_modules의 express 패키지를 가져온다.
const express = require('express');
// const { Script } = require('vm');


//app이라는 변수에 express 함수의 변환 값을 저장한다.
const app = express();
const http = require('http').Server(app);
//환경변수에서 port를 가져온다. 환경변수가 없을시 5050포트를 지정한다.
// const server = app.listen(3000, () => {
//     console.log('Start Server');
// });



app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/retrofit', retrofitRouter);

app.use(session({
    secret: 'root', // 데이터를 암호화 하기 위해 필요한 옵션
    resave: false, // 요청이 왔을때 세션을 수정하지 않더라도 다시 저장소에 저장되도록
    saveUninitialized: true, // 세션이 필요하면 세션을 실행시칸다(서버에 부담을 줄이기 위해)
    store: new FileStore() // 세션이 데이터를 저장하는 곳
}));

//REST API의 한가지 종류인 GET 리퀘스트를 정의하는 부분입니다.
//app.get이라고 작성했기 때문에 get 요청으로 정의가 되고
//app.post로 작성할 경우 post 요청으로 정의가 됩니다.
//REST API의 종류 (get, post, update, delete 등등)을 사용하여 End Point를 작성하실 수 있습니다.


app.get('/', function (req, res) {
    res.render('home');
})

http.listen(8500, function (req, res) {
    console.log('listening...');
});

app.get('/login', function (req, res) {
    console.log('로그인 페이지')
    res.render("login");
})

app.post('/login', (req, res) => {
    const body = req.body;
    const userid = body.userid;
    const userpassword = body.userpassword;

    client.query('select * from userlist where userid=?', [userid], (err, data) => {
        // 로그인 확인
        if (data[0] == null) {
            console.log('로그인 실패');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("로그인 불가. 아이디가 없습니다.")</script>');
            res.write('<script>window.location="../"</script>');
            res.end();
        }
        else if (userid == data[0].userid && userpassword == data[0].userpassword) {
            console.log('로그인 성공');
            // 세션에 추가
            req.session.is_logined = true;
            req.session.username = data.username;
            req.session.userid = data.userid;
            req.session.userpassword = data.userpassword;

            req.session.save(function () { // 세션 스토어에 적용하는 작업
                res.render('camera', { // 정보전달
                    username: data[0].username,
                    userid: data[0].userid,
                    userpassword: data[0].userpassword,
                    is_logined: true
                });
            });
            res.end();
        } else {
            console.log('로그인 실패');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("로그인 불가. 아이디와 비밀번호를 다시 한번 확인해주세요!")</script>');
            res.write('<script>window.location="../"</script>');
            res.end();

            res.render('login');
        }
    });

});



app.get('/new', function (req, res) {
    console.log('회원가입 페이지')
    res.render("new");
})

app.post('/new', (req, res) => {
    console.log('회원가입 하는중')

    const body = req.body;
    const username = body.username;
    const userid = body.userid;
    const userpassword = body.userpassword;
    const userphone = body.userphone;

    client.query('select * from userlist where userid=?', [userid], (err, data) => {
        if (username == "" || userpassword == "" || userphone == "") {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("모두 입력해주세요.")</script>');
            res.write('<script>window.location="../"</script>');
            res.end();

        }
        else if (data.length == 0) {
            console.log('회원가입 성공');
            client.query('insert into userlist(username, userid, userpassword, userphone) values(?,?,?,?)', [
                username, userid, userpassword, userphone
            ]);
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("회원가입이 완료되었습니다!")</script>');
            res.write('<script>window.location="../"</script>');
            res.end();
            // res.redirect('/');
        }
        else {
            console.log('회원가입 실패');
            // res.send('<script>alert("회원가입 실패");</script>')
            // res.redirect('/login');
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.write('<script>alert("회원가입에 실패하였습니다. 다시 한번 확인해주세요!")</script>');
            res.write('<script>window.location="../"</script>');
            res.end();
        }
    });
});




// app.get('/get', function (req, res, next) {
//     console.log('GET 호출 / data : ' + req.query.data);
//     console.log('path : ' + req.path);
//     res.send('get success')
// });

// app.get('/camera', (req, res) => {
//     res.render('camera');
// })

// app.post('/camera', (req, res) => {
//     res.render('camera');
//     msg=req.body.msg;
//     msh=req.body.msh;
//     console.log(msg+ " " + msh);
//     // console.log();
// })

app.get('/temphum', (req, res) => {
    console.log("temphum : " + msg+ " " + msh);
    res.send("temp : " + msg + ", hum : " + msh);
})

app.get('/handle', (req, res) => {
    res.send(remote);
})

app.get('/stop', (req, res) => {
    remote = "stop";
    res.end();
})

app.get('/go', (req, res) => {
    remote = "go";
    res.end();
})

app.get('/right', (req, res) => {
    remote = "right";
    res.end();
})

app.get('/back', (req, res) => {
    remote = "back";
    res.end();
})

app.get('/left', (req, res) => {
    remote = "left";
    res.end();
})

module.exports = app;
// express 서버를 실행할 때 필요한 포트 정의 및 실행 시 callback 함수를 받습니다a
